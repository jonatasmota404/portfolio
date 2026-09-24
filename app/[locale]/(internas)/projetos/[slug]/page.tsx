import { MDXRemote } from "next-mdx-remote/rsc";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { metadataPagina } from "@/lib/seo";
import { buscarReadmeLocalizado, listarRepositorios } from "@/lib/github";
import { truncar } from "@/lib/seo";
import { PlacaSvg, TracoSvg, AnotacaoSvg } from "@/components/prosa/PlacaSvg";
import { componentesProsa } from "@/components/prosa/prosa";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  // Mesma lista (cacheada) da página de Projetos — daqui sai a description real do repositório.
  const repo = (await listarRepositorios().catch(() => [])).find((r: any) => r.name === slug);
  const nome: string = repo?.name ?? slug;
  const descricao = repo?.description ? truncar(repo.description) : t("projetoDescricaoFallback", { nome });
  return metadataPagina({ locale, caminho: `/projetos/${slug}`, titulo: nome, descricao });
}

export default async function Projeto({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const [readme, repos, t] = await Promise.all([
    buscarReadmeLocalizado(slug, locale),
    listarRepositorios().catch(() => null),
    getTranslations("projetos"),
  ]);

  // Slug que não é um repositório conhecido é 404; repositório sem README continua com o aviso.
  if (!readme && repos && !repos.some((r: any) => r.name === slug)) notFound();

  if (!readme) return <p className="conteudo pt-[84px] pb-12">{t("semReadme")}</p>;

  return (
    <article className="conteudo pt-[84px] pb-12 max-w-[820px]">
      <p className="rotulo mb-3">{t("rotuloProjeto")}</p>
      <h1 className="heading-1 mb-10">{slug}</h1>
      <MDXRemote
        source={readme}
        components={{ ...componentesProsa, PlacaSvg, TracoSvg, AnotacaoSvg }}
        options={{ blockJS: false }}
      />
    </article>
  );
}