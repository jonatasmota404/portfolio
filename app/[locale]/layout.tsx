import "../globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { EB_Garamond, Cormorant, JetBrains_Mono } from "next/font/google";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { AmbienteFundo } from "@/components/codex/AmbienteFundo";
import { ZonaProvider } from "@/context/ZonaContext";

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
            <body className={`${corpo.variable} ${titulos.variable} ${mono.variable} antialiased`}>
                <NextIntlClientProvider messages={messages}>
                    <ZonaProvider>
                        <AmbienteFundo />
                        {children}
                    </ZonaProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}