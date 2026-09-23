import * as THREE from "three";

export type RepoGitHub = {
  name: string;
  description?: string;
  html_url: string;
  created_at: string;
  pushed_at: string;
  topics?: string[];
};

export type NoRepo = {
  id: string;
  nome: string;
  tags: string[];
  descricao: string;
  htmlUrl: string;
  destaque: boolean;
  commits: number;
  nascimento: number;
  hue: number;
};

// Hash simples determinístico para gerar hue a partir do nome
export function gerarHue(nome: string): number {
  let hash = 0;
  const prime = 31;
  for (let i = 0; i < nome.length; i++) {
    hash = (hash * prime + nome.charCodeAt(i)) % 360;
  }
  return Math.abs(hash);
}

// Formata nome do repositório (remove hífens, capitaliza)
function formatarNome(nome: string): string {
  return nome
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

// Calcula dias desde uma data até hoje
function diasDesde(data: string | Date): number {
  const d = new Date(data);
  const hoje = new Date();
  const ms = hoje.getTime() - d.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function prepararNosRaizes(
  repos: RepoGitHub[],
  contagensCommits: Record<string, number>,
  pinned: string[]
): NoRepo[] {
  const pinnedSet = new Set(pinned);
  const usarPinned = pinned.length > 0;
  return repos.map((repo, idx) => {
    const destaque = usarPinned ? pinnedSet.has(repo.name) : idx < 5; // fallback: regra antiga se não houver pinned configurado ou a busca falhar
    const diasCriacao = diasDesde(repo.created_at);

    // nascimento: se criado há menos de 365 dias, inverte a escala (0-364)
    // mais antigo (maior diasCriacao) = menor nascimento (nasce antes)
    let nascimento = 0;
    if (diasCriacao < 365) {
      nascimento = 364 - diasCriacao;
    }

    // commits: use contagem real para destaques, proxy para outros
    let commits = 0;
    if (destaque) {
      commits = contagensCommits[repo.name] ?? 0;
    } else {
      // proxy: dias entre created_at e pushed_at
      const diasAtividade = Math.max(1, diasDesde(repo.pushed_at) - diasCriacao);
      commits = Math.max(1, diasAtividade / 10); // escala arbitrária
    }

    return {
      id: repo.name,
      nome: formatarNome(repo.name),
      tags: repo.topics?.filter((t) => t !== "portfolio") ?? [],
      descricao: repo.description ?? "",
      htmlUrl: repo.html_url,
      destaque,
      commits,
      nascimento,
      hue: gerarHue(repo.name),
    };
  });
}

export function prepararLigacoes(
  nos: NoRepo[]
): Array<{ a: string; b: string; forte: boolean }> {
  const ligacoes: Array<{ a: string; b: string; forte: boolean }> = [];
  const nosPorId = new Map(nos.map((n) => [n.id, n]));
  const jaSao = new Set<string>();

  // Ligações fortes: tags em comum
  for (let i = 0; i < nos.length; i++) {
    for (let j = i + 1; j < nos.length; j++) {
      const noA = nos[i];
      const noB = nos[j];
      const tagsA = new Set(noA.tags);
      const tagsB = new Set(noB.tags);
      const emComum = [...tagsA].some((t) => tagsB.has(t));

      if (emComum) {
        const chave = [noA.id, noB.id].sort().join("-");
        if (!jaSao.has(chave)) {
          ligacoes.push({ a: noA.id, b: noB.id, forte: true });
          jaSao.add(chave);
        }
      }
    }
  }

  // Fallback: se um nó não tem ligações fortes, conecta ao mais próximo por nascimento
  for (const no of nos) {
    const temLigacao = ligacoes.some((l) => l.a === no.id || l.b === no.id);
    if (!temLigacao && nos.length > 1) {
      // Acha o mais próximo por nascimento
      let maisPróximo = nos[0];
      let menorDist = Math.abs(nos[0].nascimento - no.nascimento);

      for (const outro of nos) {
        if (outro.id === no.id) continue;
        const dist = Math.abs(outro.nascimento - no.nascimento);
        if (dist < menorDist) {
          menorDist = dist;
          maisPróximo = outro;
        }
      }

      const chave = [no.id, maisPróximo.id].sort().join("-");
      if (!jaSao.has(chave)) {
        ligacoes.push({ a: no.id, b: maisPróximo.id, forte: false });
        jaSao.add(chave);
      }
    }
  }

  return ligacoes;
}

// Gerador pseudoaleatório determinístico (mulberry32).
export function rng(a: number) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Gerador semeado pelos ids dos nós: mesma lista de repositórios → mesma
// sequência → mesmas posições, tanto na cena quanto no cálculo das câmeras.
export function rngDosNos(nos: NoRepo[]) {
  const seedTxt = nos.map((n) => n.id).join("|");
  let seed = 0; for (let i = 0; i < seedTxt.length; i++) seed = (seed * 31 + seedTxt.charCodeAt(i)) | 0;
  return rng(seed || 4242);
}

export function gerarPosicoes(nos: NoRepo[], rr: () => number): THREE.Vector3[] {
  const out: THREE.Vector3[] = new Array(nos.length);
  const destaques = nos.map((n, i) => ({ n, i })).filter((x) => x.n.destaque);
  const outros = nos.map((n, i) => ({ n, i })).filter((x) => !x.n.destaque);
  const GOLDEN = Math.PI * (3 - Math.sqrt(5));
  destaques.forEach((d, k) => {
    const ang = k * GOLDEN;
    const t = destaques.length > 1 ? k / (destaques.length - 1) : 0.5;
    // Espiral áurea com raio 6→13. O enquadramento não depende mais deste
    // raio: as câmeras das seções são calculadas a partir destas posições
    // (calcularCamerasSecoes), então a espiral pode crescer com novos destaques.
    const raio = 6 + t * 7;
    out[d.i] = new THREE.Vector3(Math.cos(ang) * raio, (rr() - 0.5) * 10, Math.sin(ang) * raio * 0.6);
  });
  // Nós sem destaque orbitam um destaque, mas precisam respeitar a mesma
  // distância mínima (2.4) usada pelos decorativos, senão o deslocamento
  // aleatório pode cair sobre outro nó real já posicionado.
  outros.forEach((d, k) => {
    const base = destaques.length ? out[destaques[k % destaques.length].i] : new THREE.Vector3(0, 0, 0);
    const ocupados = [...destaques, ...outros.slice(0, k)].map((x) => out[x.i]).filter(Boolean);
    let tentativa: THREE.Vector3;
    let tentativas = 0;
    do {
      tentativa = base.clone().add(new THREE.Vector3((rr() - 0.5) * 10, (rr() - 0.5) * 6, (rr() - 0.5) * 10));
      tentativas++;
    } while (tentativas < 30 && ocupados.some((p) => p.distanceTo(tentativa) < 2.4));
    out[d.i] = tentativa;
  });
  return out;
}

export type IdSecao = "hero" | "bio" | "projetos" | "como-trabalho" | "escritos" | "contato";
export type CameraSecao = { position: [number, number, number]; target: [number, number, number] };

// Mesmo FOV vertical da PerspectiveCamera de CenaRaizes.
const FOV_VERTICAL = 50;
// Fração da tela (NDC) que a nuvem de destaques pode ocupar no enquadramento
// completo — folga para o drift do mouse e para o tamanho visual dos nós.
const MARGEM_TELA = 0.8;
// Com poucos destaques (ex.: 1) a distância de enquadramento tende a zero;
// este piso mantém a câmera afastada o bastante para mostrar a rede ao redor.
const DISTANCIA_MINIMA = 14;
// Nas seções com zoom < 1 a câmera entra na nuvem; nenhum destaque pode
// ficar mais perto que isto da lente (viraria um borrão cobrindo a tela).
const FOLGA_LENTE = 6;
// Varredura de azimute em torno do ângulo-base de cada seção, usada para
// fugir de ângulos que alinham destaques na profundidade.
const DESVIOS_AZIMUTE = [0, -0.07, 0.07, -0.14, 0.14, -0.21, 0.21, -0.28, 0.28, -0.35, 0.35];

// zoom = fração da distância que enquadra TODOS os destaques. O hero (1.0)
// garante que todo destaque aparece em pelo menos uma câmera; as demais
// seções chegam mais perto para variar o ritmo, e o contato abre o plano.
const SLOTS: Array<{ id: IdSecao; azimute: number; elevacao: number; zoom: number }> = [
  { id: "hero", azimute: 1.45, elevacao: 0.15, zoom: 1.0 },
  { id: "bio", azimute: 2.75, elevacao: 0.3, zoom: 0.8 },
  { id: "projetos", azimute: 0.55, elevacao: -0.2, zoom: 0.85 },
  { id: "como-trabalho", azimute: 4.3, elevacao: 0.4, zoom: 0.75 },
  { id: "escritos", azimute: 2.1, elevacao: -0.3, zoom: 0.85 },
  { id: "contato", azimute: 5.4, elevacao: 0.55, zoom: 1.1 },
];

const UP = new THREE.Vector3(0, 1, 0);

// Coordenadas de cada ponto no referencial de uma câmera que olha para
// `centro` a partir da direção unitária `dir`: u (lateral), v (vertical),
// w (componente em direção à câmera).
function referencialCamera(pts: THREE.Vector3[], centro: THREE.Vector3, dir: THREE.Vector3) {
  const frente = dir.clone().negate();
  const direita = new THREE.Vector3().crossVectors(frente, UP).normalize();
  const cima = new THREE.Vector3().crossVectors(direita, frente);
  return pts.map((p) => {
    const rel = p.clone().sub(centro);
    return { u: rel.dot(direita), v: rel.dot(cima), w: rel.dot(dir) };
  });
}

/**
 * Câmeras das 6 seções da Home calculadas a partir das posições reais dos
 * destaques (as mesmas de gerarPosicoes), em vez de valores fixos: funciona
 * para qualquer quantidade de repositórios pinned.
 *
 * Para cada seção: (1) a distância é a mínima em que todos os destaques
 * cabem em ±MARGEM_TELA da tela no `aspect` informado (solução analítica da
 * projeção perspectiva), multiplicada pelo zoom da seção; (2) o azimute é
 * ajustado dentro de ±0.35 rad para maximizar a menor distância em tela
 * entre dois destaques — evita ângulos que os empilham na profundidade.
 */
export function calcularCamerasSecoes(nos: NoRepo[], aspect = 16 / 9): Record<IdSecao, CameraSecao> {
  const posicoes = gerarPosicoes(nos, rngDosNos(nos));
  const destaquesPos = nos.map((n, i) => (n.destaque ? posicoes[i] : null)).filter((p): p is THREE.Vector3 => p !== null);

  const centro = new THREE.Vector3();
  destaquesPos.forEach((p) => centro.add(p));
  if (destaquesPos.length) centro.divideScalar(destaquesPos.length);

  const tanV = Math.tan(THREE.MathUtils.degToRad(FOV_VERTICAL / 2));
  const tanH = tanV * aspect;

  const out = {} as Record<IdSecao, CameraSecao>;
  SLOTS.forEach((s) => {
    let melhor: { dir: THREE.Vector3; dist: number; sep: number } | null = null;
    for (const desvio of DESVIOS_AZIMUTE) {
      const az = s.azimute + desvio;
      const dir = new THREE.Vector3(Math.cos(s.elevacao) * Math.cos(az), Math.sin(s.elevacao), Math.cos(s.elevacao) * Math.sin(az));
      const ref = referencialCamera(destaquesPos, centro, dir);
      const enquadra = ref.reduce((d, r) => Math.max(d, r.w + Math.max(Math.abs(r.u) / (MARGEM_TELA * tanH), Math.abs(r.v) / (MARGEM_TELA * tanV))), 0);
      const maisProximo = ref.reduce((m, r) => Math.max(m, r.w), 0);
      const dist = Math.max(Math.max(DISTANCIA_MINIMA, enquadra) * s.zoom, maisProximo + FOLGA_LENTE);
      // Posição em tela (com x em proporção real) dos destaques visíveis.
      const tela = ref
        .filter((r) => dist - r.w > 0.5)
        .map((r) => ({ x: (r.u / ((dist - r.w) * tanH)) * aspect, y: r.v / ((dist - r.w) * tanV), dentro: Math.abs(r.u / ((dist - r.w) * tanH)) <= 1 && Math.abs(r.v / ((dist - r.w) * tanV)) <= 1 }))
        .filter((p) => p.dentro);
      let sep = Infinity;
      for (let a = 0; a < tela.length; a++) for (let b = a + 1; b < tela.length; b++) sep = Math.min(sep, Math.hypot(tela[a].x - tela[b].x, tela[a].y - tela[b].y));
      if (!melhor || sep > melhor.sep + 1e-6) melhor = { dir, dist, sep };
    }
    const pos = centro.clone().addScaledVector(melhor!.dir, melhor!.dist);
    const r2 = (x: number) => Math.round(x * 100) / 100;
    out[s.id] = { position: [r2(pos.x), r2(pos.y), r2(pos.z)], target: [r2(centro.x), r2(centro.y), r2(centro.z)] };
  });
  return out;
}
