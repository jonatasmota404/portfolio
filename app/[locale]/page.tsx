import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { listarRepositorios, listarEscritos } from "@/lib/github";
import { SecaoProjetosFiltrada } from "@/components/codex/SecaoProjetosFiltrada";
import { EscritosFiltrados } from "@/components/codex/EscritosFiltrados";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations("home");
  const repos = await listarRepositorios();
  const posts = await listarEscritos(locale); 

  return (
    <div className="py-12 space-y-16">
      <section className="text-center">
        <p className="font-mono text-xs text-oxide mb-2">{t("tagline")}</p>
        <h1 className="font-voice italic text-3xl mb-4 max-w-lg mx-auto">{t("titulo")}</h1>
        <p className="text-sm opacity-70 max-w-md mx-auto mb-8">{t("descricao")}</p>
        <SecaoProjetosFiltrada repos={repos} />
      </section>

      <section>
        <div className="flex justify-between items-baseline mb-4">
          <h2 className="font-voice italic text-xl">{t("escritosTitulo")}</h2>
          <Link href="/escritos" className="text-xs font-mono">{t("verTodos")}</Link>
        </div>
        <EscritosFiltrados posts={posts} />
      </section>
    </div>
  );
}