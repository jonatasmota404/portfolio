import { listarRepositorios } from "@/lib/github";
import { ListaProjetos } from "@/components/codex/ListaProjetos";

export default async function Projetos() {
  const repos = await listarRepositorios();

  return (
    <section className="pt-2 pb-12">
      <header className="mb-10">
        <h1 className="font-voice italic text-4xl mb-3">Projetos</h1>
        <p className="font-serif text-lg opacity-75 max-w-2xl leading-relaxed">
          Uma seleção de coisas que venho construindo — de ferramentas do dia a dia a experimentos e arquiteturas de infraestrutura.
        </p>
        <hr className="border-t border-dashed border-current/20 w-32 mt-8" />
      </header>

      {/* Delega a renderização e os filtros para o Client Component */}
      <ListaProjetos repos={repos} />
    </section>
  );
}