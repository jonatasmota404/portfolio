import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

export const SITE_URL = "https://jonatas.pro";
export const NOME_SITE = "Jônatas Mota";

// Caminho público de uma rota no idioma dado: português (padrão) fica sem prefixo,
// inglês ganha /en — mesmo esquema do localePrefix "as-needed" do next-intl.
export function caminhoLocalizado(caminho: string, locale: string): string {
  const prefixo = locale === routing.defaultLocale ? "" : `/${locale}`;
  return `${prefixo}${caminho === "/" ? "" : caminho}` || "/";
}

// Corta textos longos numa fronteira de palavra, pro tamanho de uma meta description.
export function truncar(texto: string, limite = 155): string {
  const limpo = texto.replace(/\s+/g, " ").trim();
  if (limpo.length <= limite) return limpo;
  const corte = limpo.slice(0, limite - 1);
  return `${corte.slice(0, corte.lastIndexOf(" ")).replace(/[\s,.;:—-]+$/, "")}…`;
}

// Metadata de uma página interna. O openGraph precisa ser montado inteiro aqui: quando a
// página define openGraph, o Next substitui (não mescla) o objeto herdado do layout — sem
// isso, og:title ficaria com o título padrão do site em vez do título da página. Pelo mesmo
// motivo a imagem de app/[locale]/opengraph-image deixa de ser herdada e é apontada à mão;
// segmentos com opengraph-image próprio (artigos) passam imagemPropria, senão a imagem explícita
// daqui sobrescreveria a gerada pelo arquivo.
export function metadataPagina({
  locale,
  caminho,
  titulo,
  descricao,
  tipo = "website",
  imagemPropria = false,
}: {
  locale: string;
  caminho: string;
  titulo: string;
  descricao: string;
  tipo?: "website" | "article";
  imagemPropria?: boolean;
}): Metadata {
  const url = caminhoLocalizado(caminho, locale);
  return {
    title: titulo,
    description: descricao,
    alternates: {
      canonical: url,
      languages: Object.fromEntries(routing.locales.map((l) => [l, caminhoLocalizado(caminho, l)])),
    },
    openGraph: {
      type: tipo,
      siteName: NOME_SITE,
      locale: locale === "en" ? "en_US" : "pt_BR",
      url,
      title: `${titulo} · ${NOME_SITE}`,
      description: descricao,
      ...(imagemPropria
        ? {}
        : { images: [{ url: caminhoLocalizado("/opengraph-image", locale), width: 1200, height: 630, alt: NOME_SITE }] }),
    },
  };
}
