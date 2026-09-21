import { MDXRemote } from "next-mdx-remote/rsc";
import { buscarReadmeLocalizado } from "@/lib/github";
import { CodexPlate, CodexTraco, CodexAnnotation } from "@/components/codex/CodexPlate";
import { componentesProsa } from "@/components/codex/prosa";

export default async function Projeto({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const readme = await buscarReadmeLocalizado(slug, locale);

  if (!readme) return <p className="py-12">Este projeto não tem README.</p>;

  return (
    <article className="py-12">
      <h1 className="font-voice italic text-3xl mb-8">{slug}</h1>
      <MDXRemote
        source={readme}
        components={{ ...componentesProsa, CodexPlate, CodexTraco, CodexAnnotation }}
        options={{ blockJS: false }}
      />
    </article>
  );
}