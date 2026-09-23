import { MDXRemote } from "next-mdx-remote/rsc";
import { buscarReadmeLocalizado } from "@/lib/github";
import { PlacaSvg, TracoSvg, AnotacaoSvg } from "@/components/prosa/PlacaSvg";
import { componentesProsa } from "@/components/prosa/prosa";

export default async function Projeto({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const readme = await buscarReadmeLocalizado(slug, locale);

  if (!readme) return <p className="conteudo pt-[84px] pb-12">Este projeto não tem README.</p>;

  return (
    <article className="conteudo pt-[84px] pb-12 max-w-[820px]">
      <p className="rotulo mb-3">projeto</p>
      <h1 className="heading-1 mb-10">{slug}</h1>
      <MDXRemote
        source={readme}
        components={{ ...componentesProsa, PlacaSvg, TracoSvg, AnotacaoSvg }}
        options={{ blockJS: false }}
      />
    </article>
  );
}