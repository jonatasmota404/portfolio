import { MDXRemote } from "next-mdx-remote/rsc";
import { buscarArtigo } from "@/lib/github";
import { CodexPlate, CodexTraco, CodexAnnotation } from "@/components/codex/CodexPlate";
import { CodexEsboco } from "@/components/codex/CodexEsboco";
import { componentesProsa } from "@/components/codex/prosa";

export default async function Artigo({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const artigo = await buscarArtigo(slug, locale);

  if (!artigo) return <p className="py-12">Artigo não encontrado.</p>;

  return (
    <article className="py-12">
      <p className="font-mono text-xs opacity-60 mb-2">{artigo.data.data}</p>
      <h1 className="font-voice italic text-3xl mb-8">{artigo.data.titulo}</h1>
      <MDXRemote
        source={artigo.content}
        components={{ ...componentesProsa, CodexPlate, CodexTraco, CodexAnnotation, CodexEsboco }}
        options={{ blockJS: false }}
      />
    </article>
  );
}