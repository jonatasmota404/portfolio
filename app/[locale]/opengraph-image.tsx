import { getTranslations } from "next-intl/server";
import { gerarImagemOg } from "@/lib/og";
import { NOME_SITE } from "@/lib/seo";

// Fica em app/[locale] (e não em app/) porque o middleware do next-intl reescreve
// /opengraph-image para /pt/opengraph-image; aqui ela também sai no idioma certo.
// Vale para a Home e é herdada pelas páginas internas que não têm imagem própria.
// Runtime Node (padrão): o Edge Runtime está depreciado no Next 16 e desliga a geração estática.
export const alt = NOME_SITE;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return gerarImagemOg({ titulo: NOME_SITE, subtitulo: t("tagline") });
}
