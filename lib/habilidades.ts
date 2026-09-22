type Repo = { name: string; topics?: string[] };
type Post = { slug: string; titulo: string; tecnologias?: string[] };

export type StatusHabilidade = "producao" | "aprendendo";

export type NoHabilidade = {
  tecnologia: string;
  xp: number;
  status: StatusHabilidade;
  projetos: { nome: string; aprendendo?: boolean }[];
  artigos: { slug: string; titulo: string }[];
};

const IGNORAR = new Set(["portfolio"]);

function normalizar(tecnologia: string): string {
  return tecnologia.toLowerCase().replace(/\./g, "").replace(/\s+/g, "-");
}

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

export function calcularHabilidades(repos: Repo[], posts: Post[]): NoHabilidade[] {
  const nos = new Map<string, NoHabilidade>();

  function garanteNo(chave: string): NoHabilidade {
    if (!nos.has(chave)) {
      nos.set(chave, {
        tecnologia: chave,
        xp: 0,
        // Só sobe para produção ao ser vista num repositório sem o prefixo de estudo
        status: "aprendendo",
        projetos: [],
        artigos: [],
      });
    }
    return nos.get(chave)!;
  }

  for (const repo of repos) {
    for (const topico of repo.topics ?? []) {
      const { chave, aprendendo } = decomporTopico(topico);
      if (IGNORAR.has(chave)) continue;

      const no = garanteNo(chave);
      no.projetos.push({ nome: repo.name, aprendendo });
      no.xp += 1;
      if (!aprendendo) no.status = "producao";
    }
  }

  for (const post of posts) {
    for (const tecnologia of post.tecnologias ?? []) {
      const { chave } = decomporTopico(tecnologia);
      if (IGNORAR.has(chave)) continue;

      const no = garanteNo(chave);
      no.artigos.push({ slug: post.slug, titulo: post.titulo });
      no.xp += 1;
    }
  }

  return Array.from(nos.values()).sort(
    (a, b) => b.xp - a.xp || a.tecnologia.localeCompare(b.tecnologia)
  );
}
