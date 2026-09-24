import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { metadataPagina } from "@/lib/seo";
import { listarRepositorios } from "@/lib/github";
import { ListaProjetos } from "@/components/projetos/ListaProjetos";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return metadataPagina({ locale, caminho: "/projetos", titulo: t("projetosTitulo"), descricao: t("projetosDescricao") });
}

export default async function Projetos() {
  const repos = await listarRepositorios();

  return (
    <section className="conteudo pt-[84px] pb-16">
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
