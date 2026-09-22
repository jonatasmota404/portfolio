"use client";

import { RetratoAvatar } from "@/components/codex/RetratoAvatar";

type Props = {
    nome: string;
    cargo: string;
    detalhes: React.ReactNode;
    avatarUrl: string;
    rotuloContato: string;
};

export function CartaoIdentidade({ nome, cargo, detalhes, avatarUrl, rotuloContato }: Props) {
    return (
        // Troquei rounded-lg por rounded-3xl e adicionei shadow-sm para igualar ao resto
        <div className="mundo-painel border rounded-3xl shadow-sm p-7 flex flex-col gap-4 relative overflow-hidden">
            <RetratoAvatar urlFoto={avatarUrl} />
            <div>
                <h1 className="font-voice italic text-2xl mb-1">{nome}</h1>
                {cargo && <p className="text-sm opacity-75">{cargo}</p>}
                <div className="mt-3 text-sm leading-relaxed">{detalhes}</div>
            </div>
            <div className="flex gap-3 items-center">
                <a
                    href="mailto:jonatasjr.019@gmail.com"
                    className="font-mono text-xs px-5 py-2.5 rounded-full font-semibold transition-opacity hover:opacity-90"
                    style={{ background: "var(--accent)", color: "var(--on-accent)" }}
                >
                    {rotuloContato}
                </a>

                <a
                    href="/curriculo.pdf"
                    download
                    className="font-mono text-xs px-5 py-2.5 rounded-full bg-black/5 hover:bg-black/10 transition-colors"
                    style={{
                        backgroundColor: "color-mix(in srgb, var(--ink) 8%, transparent)",
                        color: "var(--ink)",
                    }}
                >
                    currículo
                </a>
            </div>
        </div>
    );
}