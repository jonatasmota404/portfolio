import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

// Renderiza dentro do layout de [locale] (cabeçalho, tema, mensagens). Nas
// páginas internas o fundo ambiente vem do layout do grupo (internas).
export default async function NaoEncontrado() {
  const t = await getTranslations("erro404");

  return (
    <section className="conteudo pt-[84px] pb-16 min-h-[100svh] flex items-center">
      <div className="painel p-8 md:p-12 max-w-2xl">
        <p className="rotulo mb-3">{t("rotulo")}</p>
        <h1 className="heading-1 mb-4">{t("titulo")}</h1>
        <p className="apoio text-lg mb-8">{t("descricao")}</p>
        <Link href="/" className="raizes-btn raizes-btn-pri">
          {t("voltar")}
        </Link>
      </div>
    </section>
  );
}
