import type { Zona } from "./zonas";

type Repo = { name: string; topics?: string[] };
type Post = { slug: string; titulo: string; tags?: string[]; tecnologias?: string[] };

export type StatusHabilidade = "producao" | "aprendendo";

export type NoHabilidade = {
  tecnologia: string;
  zona: Zona;
  xp: number;
  status: StatusHabilidade;
  projetos: { nome: string; aprendendo?: boolean }[];
  artigos: { slug: string; titulo: string }[];
};

const ZONAS_VALIDAS: Zona[] = ["backend", "frontend", "infra"];
const IGNORAR = new Set(["portfolio", ...ZONAS_VALIDAS]);

// Deteta se o tópico possui prefixo de aprendizagem
function decomporTopico(topico: string): { chave: string; aprendendo: boolean } {
  const limpo = topico.toLowerCase().trim();
  const prefixoMatch = limpo.match(/^(?:learning:|aprendendo-)(.+)$/);
  
  if (prefixoMatch) {
    return {
      chave: normalizar(prefixoMatch[1]),
      aprendendo: true,
    };
  }

  return {
    chave: normalizar(limpo),
    aprendendo: false,
  };
}

function normalizar(tecnologia: string): string {
  return tecnologia.toLowerCase().replace(/\./g, "").replace(/\s+/g, "-");
}

export function calcularHabilidades(repos: Repo[], posts: Post[]): NoHabilidade[] {
  // Passo 1: Descobre a zona dominante de cada tecnologia
  const contagemZona = new Map<string, Record<Zona, number>>();

  function registrarCoOcorrencia(chave: string, zonasPresentes: Zona[]) {
    if (IGNORAR.has(chave)) return;
    if (!contagemZona.has(chave)) {
      contagemZona.set(chave, { backend: 0, frontend: 0, infra: 0 });
    }
    const contagem = contagemZona.get(chave)!;
    for (const z of zonasPresentes) contagem[z] += 1;
  }

  for (const repo of repos) {
    const topics = repo.topics ?? [];
    const zonasNoRepo = topics
      .map((t) => decomporTopico(t).chave)
      .filter((t): t is Zona => ZONAS_VALIDAS.includes(t as Zona));

    for (const topic of topics) {
      const { chave } = decomporTopico(topic);
      registrarCoOcorrencia(chave, zonasNoRepo);
    }
  }

  for (const post of posts) {
    const zonasNoPost = (post.tags ?? [])
      .map((t) => normalizar(t))
      .filter((t): t is Zona => ZONAS_VALIDAS.includes(t as Zona));

    for (const tecnologia of post.tecnologias ?? []) {
      const { chave } = decomporTopico(tecnologia);
      registrarCoOcorrencia(chave, zonasNoPost);
    }
  }

  function zonaDominante(chave: string): Zona | null {
    const contagem = contagemZona.get(chave);
    if (!contagem) return null;
    const [zona, valor] = (Object.entries(contagem) as [Zona, number][]).sort((a, b) => b[1] - a[1])[0];
    return valor > 0 ? zona : null;
  }

  // Passo 2: Monta os nós e define o status de produção vs aprendizado
  const nos = new Map<string, NoHabilidade>();

  function garanteNo(chave: string, aprendendoInicial: boolean): NoHabilidade | null {
    const zona = zonaDominante(chave);
    if (!zona) return null;

    if (!nos.has(chave)) {
      nos.set(chave, {
        tecnologia: chave,
        zona,
        xp: 0,
        status: aprendendoInicial ? "aprendendo" : "producao",
        projetos: [],
        artigos: [],
      });
    }
    return nos.get(chave)!;
  }

  for (const repo of repos) {
    for (const topic of repo.topics ?? []) {
      const { chave, aprendendo } = decomporTopico(topic);
      if (IGNORAR.has(chave)) continue;

      const no = garanteNo(chave, aprendendo);
      if (no) {
        no.projetos.push({ nome: repo.name, aprendendo });
        no.xp += 1;
        // Se a tecnologia for vista em qualquer repositório sem a tag de estudo, sobe para produção
        if (!aprendendo) {
          no.status = "producao";
        }
      }
    }
  }

  for (const post of posts) {
    for (const tecnologia of post.tecnologias ?? []) {
      const { chave, aprendendo } = decomporTopico(tecnologia);
      if (IGNORAR.has(chave)) continue;

      // Se só existir em artigos, assume o estado de aprendizagem até ser aplicada num repo de produção
      const no = garanteNo(chave, true);
      if (no) {
        no.artigos.push({ slug: post.slug, titulo: post.titulo });
        no.xp += 1;
        if (!aprendendo && no.projetos.some((p) => !p.aprendendo)) {
          no.status = "producao";
        }
      }
    }
  }

  return Array.from(nos.values()).sort((a, b) => b.xp - a.xp);
}