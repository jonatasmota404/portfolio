export type Zona = "infra" | "frontend" | "backend";

export const ZONAS: Record<Zona, { titulo: string; cor: string; chipsPadrao: string[]; caso: string }> = {
  infra: { titulo: "Infra & confiabilidade", cor: "var(--accent)", chipsPadrao: ["Docker", "CI/CD"], caso: "Prova ao vivo: uptime e horário de deploy deste site." },
  frontend: { titulo: "Frontend", cor: "var(--accent2)", chipsPadrao: ["React", "Next.js", "Tailwind"], caso: "Projetos práticos em construção." },
  backend: { titulo: "Backend", cor: "color-mix(in srgb, var(--accent) 60%, var(--bg))", chipsPadrao: ["Node.js", "TypeScript", "Nest.js"], caso: "Caso real: Sistema Retífica Exacta, em produção desde 2023." },
};

// mapeia zona do instrumento → tag usada nos artigos (frontend ainda não tem equivalente)
export const TAG_ARTIGO_POR_ZONA: Record<Zona, string | null> = {
  infra: "Infra",
  backend: "Backend",
  frontend: null,
};

type RepoComTopics = { topics?: string[] };

export function chipsDinamicos(repos: RepoComTopics[], zona: Zona): string[] {
  const relevantes = repos.filter((r) => r.topics?.includes(zona));
  const outrosTopics = relevantes.flatMap((r) => r.topics ?? []).filter((t) => t !== zona && t !== "portfolio");
  const unicos = Array.from(new Set(outrosTopics));
  return unicos.length > 0 ? unicos.slice(0, 4) : ZONAS[zona].chipsPadrao;
}