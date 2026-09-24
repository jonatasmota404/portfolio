import "../globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { EB_Garamond, Inter, JetBrains_Mono, Inter_Tight } from "next/font/google";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { TemaProvider } from "@/context/TemaContext";
import { Cabecalho } from "@/components/layout/Cabecalho";
import { SITE_URL, NOME_SITE, caminhoLocalizado } from "@/lib/seo";

// Inter é a fonte padrão do corpo; a serifada fica reservada ao texto longo dos artigos.
const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });
const serifada = EB_Garamond({ subsets: ["latin"], variable: "--font-serif" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
const tight = Inter_Tight({ subsets: ["latin"], variable: "--font-tight" });

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "meta" });
    const titulo = t("titulo");
    const descricao = t("descricao");

    return {
        metadataBase: new URL(SITE_URL),
        title: { default: titulo, template: `%s · ${NOME_SITE}` },
        description: descricao,
        alternates: {
            canonical: caminhoLocalizado("/", locale),
            languages: Object.fromEntries(routing.locales.map((l) => [l, caminhoLocalizado("/", l)])),
        },
        openGraph: {
            type: "website",
            siteName: NOME_SITE,
            locale: locale === "en" ? "en_US" : "pt_BR",
            url: caminhoLocalizado("/", locale),
            title: titulo,
            description: descricao,
        },
        twitter: { card: "summary_large_image" },
    };
}

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    if (!routing.locales.includes(locale as any)) notFound();

    const messages = await getMessages();

    return (
        // As variáveis de fonte ficam no <html> (e não no <body>) porque a regra base de
        // font-family também mora lá: no <body> elas não alcançariam o :root e a fonte caía para Times.
        <html
            lang={locale}
            suppressHydrationWarning
            className={`${sans.variable} ${serifada.variable} ${mono.variable} ${tight.variable}`}
        >
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `(function(){try{var t=localStorage.getItem('portfolio-tema');var validos=['ouro','gelo','menta','mar','brasa'];document.documentElement.setAttribute('data-tema',(t&&validos.indexOf(t)>-1)?t:'ouro');}catch(e){}})();`,
                    }}
                />
            </head>
            <body className="antialiased">
                <NextIntlClientProvider messages={messages}>
                    <TemaProvider>
                        <Cabecalho />
                        {children}
                    </TemaProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}