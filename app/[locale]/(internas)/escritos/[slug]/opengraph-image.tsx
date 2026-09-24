import { getTranslations } from "next-intl/server";
import { buscarArtigo } from "@/lib/github";
import { gerarImagemOg } from "@/lib/og";
import { NOME_SITE } from "@/lib/seo";

// Prévia de compartilhamento própria de cada artigo, com o título real dele.
// Roda no runtime Node (padrão): buscarArtigo usa gray-matter, que depende de APIs do Node.
export const alt = NOME_SITE;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const artigo = await buscarArtigo(slug, locale);
  return gerarImagemOg({
    titulo: artigo?.data.titulo ?? t("escritosTitulo"),
    subtitulo: NOME_SITE,
    rotulo: t("escritosTitulo"),
  });
}
