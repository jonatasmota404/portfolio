import "../globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { EB_Garamond, Inter, JetBrains_Mono, Inter_Tight } from "next/font/google";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { TemaProvider } from "@/context/TemaContext";
import { Cabecalho } from "@/components/codex/Cabecalho";

// Inter é a fonte padrão do corpo; a serifada fica reservada ao texto longo dos artigos.
const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });
const serifada = EB_Garamond({ subsets: ["latin"], variable: "--font-serif" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
const tight = Inter_Tight({ subsets: ["latin"], variable: "--font-tight" });

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
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