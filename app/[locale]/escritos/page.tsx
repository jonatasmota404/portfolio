import { listarEscritos } from "@/lib/github";
import { ListaEscritos } from "@/components/codex/ListaEscritos";

export default async function Escritos({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const posts = await listarEscritos(locale);

  return (
    <section className="pt-2 pb-12">
      
      {/* Cabeçalho alinhado com o padrão do portfólio */}
      <header className="mb-10">
        <h1 className="font-voice italic text-4xl mb-3">Escritos</h1>
        <p className="font-serif text-lg opacity-75 max-w-2xl leading-relaxed">
          Notas e aprendizados sobre infraestrutura, backend e os bastidores de construir software.
        </p>
        <hr className="border-t border-dashed border-current/20 w-32 mt-8" />
      </header>

      {/* A lista agora vai renderizar um Grid por dentro */}
      <ListaEscritos posts={posts} />
      
    </section>
  );
}