import "../globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { EB_Garamond, Cormorant, JetBrains_Mono } from "next/font/google";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { TemaProvider } from "@/context/TemaContext";

const corpo = EB_Garamond({ subsets: ["latin"], variable: "--font-serif" });
const titulos = Cormorant({ subsets: ["latin"], style: "italic", variable: "--font-voice" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

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
        <html lang={locale}>
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `(function(){try{var t=localStorage.getItem('portfolio-tema');var validos=['ouro','gelo','menta','mar','brasa'];document.documentElement.setAttribute('data-tema',(t&&validos.indexOf(t)>-1)?t:'ouro');}catch(e){}})();`,
                    }}
                />
            </head>
            <body className={`${corpo.variable} ${titulos.variable} ${mono.variable} antialiased`}>
                <NextIntlClientProvider messages={messages}>
                    <TemaProvider>
                        {children}
                    </TemaProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}