import Script from "next/script";

// Encaixe para analytics sem provedor definido: só renderiza algo se NEXT_PUBLIC_ANALYTICS_SRC existir.
// As variáveis NEXT_PUBLIC_* são embutidas no build, então mudar o valor exige novo build/deploy.
export function AnalyticsScript() {
    const src = process.env.NEXT_PUBLIC_ANALYTICS_SRC;
    const nomeAtributo = process.env.NEXT_PUBLIC_ANALYTICS_ATTR_NAME; // ex.: "data-domain" (Plausible), "data-website-id" (Umami)
    const valorAtributo = process.env.NEXT_PUBLIC_ANALYTICS_ATTR_VALUE;

    if (!src) return null;

    // O nome do atributo varia por provedor, então entra via spread de objeto.
    const atributoProvedor: Record<string, string> = nomeAtributo && valorAtributo ? { [nomeAtributo]: valorAtributo } : {};

    return <Script src={src} strategy="afterInteractive" {...atributoProvedor} />;
}
