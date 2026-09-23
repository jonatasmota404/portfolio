import { MDXRemote } from "next-mdx-remote/rsc";
import { buscarArtigo } from "@/lib/github";
import { PlacaSvg, TracoSvg, AnotacaoSvg } from "@/components/prosa/PlacaSvg";
import { MolduraSvg } from "@/components/prosa/MolduraSvg";
import { componentesProsa } from "@/components/prosa/prosa";

export default async function Artigo({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const artigo = await buscarArtigo(slug, locale);

  if (!artigo) return <p className="conteudo pt-[84px] pb-12">Artigo não encontrado.</p>;

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