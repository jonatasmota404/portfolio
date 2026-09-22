import { listarRepositorios } from "@/lib/github";
import { ListaProjetos } from "@/components/codex/ListaProjetos";

export default async function Projetos() {
  const repos = await listarRepositorios();

  return (
    <section className="conteudo pt-10 pb-16">
      <header className="mb-10">
        <p className="rotulo mb-3">repositórios</p>
        <h1 className="heading-1 mb-4">Projetos</h1>
        <p className="apoio text-lg max-w-2xl">
          Uma seleção de coisas que venho construindo — de ferramentas do dia a dia a experimentos e arquiteturas de infraestrutura.
        </p>
        <hr className="w-32 mt-8" style={{ borderColor: "var(--line)" }} />
      </header>

      {/* Delega a renderização e os filtros para o Client Component */}
      <ListaProjetos repos={repos} />
    </section>
  );
}
