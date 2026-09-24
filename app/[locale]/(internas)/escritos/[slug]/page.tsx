import { MDXRemote } from "next-mdx-remote/rsc";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { metadataPagina } from "@/lib/seo";
import { buscarArtigo } from "@/lib/github";
import { truncar } from "@/lib/seo";
import { PlacaSvg, TracoSvg, AnotacaoSvg } from "@/components/prosa/PlacaSvg";
import { MolduraSvg } from "@/components/prosa/MolduraSvg";
import { componentesProsa } from "@/components/prosa/prosa";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const artigo = await buscarArtigo(slug, locale);
  const titulo: string = artigo?.data.titulo ?? t("escritosTitulo");
  // Frontmatter usa "resumo"; artigos antigos ainda trazem "descricao".
  const resumo: string | undefined = artigo?.data.resumo ?? artigo?.data.descricao;
  const descricao = resumo ? truncar(resumo) : t("escritosDescricao");
  return metadataPagina({ locale, caminho: `/escritos/${slug}`, titulo, descricao, tipo: "article", imagemPropria: true });
}

export default async function Artigo({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const artigo = await buscarArtigo(slug, locale);

  if (!artigo) notFound();

  return (
    <article className="conteudo pt-[84px] pb-12 max-w-[820px]">
      <p className="rotulo mb-3">{artigo.data.data}</p>
      <h1 className="heading-1 mb-10">{artigo.data.titulo}</h1>
      <MDXRemote
        source={artigo.content}
        components={{ ...componentesProsa, PlacaSvg, TracoSvg, AnotacaoSvg, MolduraSvg }}
        options={{ blockJS: false }}
      />
    </article>
  );
}