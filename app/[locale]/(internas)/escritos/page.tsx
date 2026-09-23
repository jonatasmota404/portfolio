import { listarEscritos } from "@/lib/github";
import { ListaEscritos } from "@/components/escritos/ListaEscritos";

export default async function Escritos({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const posts = await listarEscritos(locale);

  return (
    <section className="conteudo pt-[84px] pb-16">
      <header className="mb-10">
        <p className="rotulo mb-3">notas</p>
        <h1 className="heading-1 mb-4">Escritos</h1>
        <p className="apoio text-lg max-w-2xl">
          Notas e aprendizados sobre infraestrutura, backend e os bastidores de construir software.
        </p>
        <hr className="w-32 mt-8" style={{ borderColor: "var(--line)" }} />
      </header>

      <ListaEscritos posts={posts} />
    </section>
  );
}
