import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE_URL, caminhoLocalizado } from "@/lib/seo";
import { listarEscritos, listarRepositorios } from "@/lib/github";

type Entrada = MetadataRoute.Sitemap[number];

// Data válida a partir de um valor de frontmatter/API (string ISO ou Date); senão, o fallback.
function dataOu(valor: unknown, fallback: Date): Date {
  const data = valor ? new Date(valor as string) : fallback;
  return Number.isNaN(data.getTime()) ? fallback : data;
}

// Uma entrada por idioma para a mesma rota (pt sem prefixo, en com /en).
function entradasDaRota(
  caminho: string,
  extra: Pick<Entrada, "lastModified" | "changeFrequency" | "priority">
): Entrada[] {
  return routing.locales.map((locale) => ({
    url: `${SITE_URL}${caminhoLocalizado(caminho, locale)}`,
    ...extra,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const agora = new Date();

  // Se o GitHub falhar, o sitemap ainda sai com as páginas estáticas.
  const [repos, escritos] = await Promise.all([
    listarRepositorios().catch((erro) => {
      console.warn("sitemap: falha ao listar repositórios", erro);
      return [];
    }),
    listarEscritos(routing.defaultLocale).catch((erro) => {
      console.warn("sitemap: falha ao listar escritos", erro);
      return [];
    }),
  ]);

  const estaticas = [
    ...entradasDaRota("/", { lastModified: agora, changeFrequency: "weekly", priority: 1.0 }),
    ...["/projetos", "/escritos", "/sobre"].flatMap((caminho) =>
      entradasDaRota(caminho, { lastModified: agora, changeFrequency: "weekly", priority: 0.8 })
    ),
  ];

  const projetos = repos.flatMap((repo: any) =>
    entradasDaRota(`/projetos/${repo.name}`, {
      lastModified: dataOu(repo.pushed_at, agora),
      changeFrequency: "monthly",
      priority: 0.6,
    })
  );

  const artigos = escritos.flatMap((artigo: any) =>
    entradasDaRota(`/escritos/${artigo.slug}`, {
      lastModified: dataOu(artigo.data, agora),
      changeFrequency: "monthly",
      priority: 0.6,
    })
  );

  return [...estaticas, ...projetos, ...artigos];
}
