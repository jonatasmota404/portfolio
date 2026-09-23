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
