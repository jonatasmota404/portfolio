"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Cabecalho } from "@/components/codex/Cabecalho";

let jaAbriuUmaVez = false;

type Fase = "fechado" | "aberto" | "virando" | "zoom" | "pronto";

const MINI = { width: 480, height: 650 };

function pontos(topo: number, meio: number, base: number) {
    return `polygon(0% 0%, ${topo}% 0%, ${meio}% 50%, ${base}% 100%, 0% 100%)`;
}

function FolhaVirando({ onFimAnimacao }: { onFimAnimacao: () => void }) {
    const quadros = [
        pontos(100, 100, 90),
        pontos(100, 88, 52),
        pontos(58, 42, 22),
        pontos(0, 0, 0),
    ];

    return (
        <>
            <motion.div
                className="absolute inset-0 bg-parchment"
                style={{ boxShadow: "inset -6px 0 18px rgba(0,0,0,0.2)" }}
                animate={{ clipPath: quadros }}
                transition={{ duration: 1.1, times: [0, 0.22, 0.6, 1], ease: [0.65, 0, 0.35, 1] }}
                onAnimationComplete={onFimAnimacao}
            />
            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
                    mixBlendMode: "overlay",
                }}
                animate={{
                    clipPath: [
                        pontos(106, 106, 96),
                        pontos(106, 94, 58),
                        pontos(64, 48, 28),
                        pontos(6, 6, 6),
                    ],
                }}
                transition={{ duration: 1.1, times: [0, 0.22, 0.6, 1], ease: [0.65, 0, 0.35, 1] }}
            />
        </>
    );
}

export default function Template({ children }: { children: React.ReactNode }) {
    const [fase, setFase] = useState<Fase>(jaAbriuUmaVez ? "pronto" : "fechado");

    useEffect(() => {
        if (!jaAbriuUmaVez) {
            const t = setTimeout(() => setFase("aberto"), 200);
            return () => clearTimeout(t);
        }
    }, []);

    // A CAIXA MESTRA UNIVERSAL (Usada tanto na versão pronta quanto na animação)
    const ConteudoPadrao = (
        <div className="w-full max-w-[1280px] mx-auto px-6 md:px-10">
            <Cabecalho />
            <main className="w-full pb-10">{children}</main>
        </div>
    );

    if (fase === "pronto") {
        return <>{ConteudoPadrao}</>;
    }

    const mini = fase === "fechado" || fase === "aberto";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink overflow-hidden">
            <div
                className="bg-parchment shadow-2xl relative overflow-y-auto overflow-x-hidden"
                style={{
                    width: mini ? `min(${MINI.width}px, 82vw)` : "100vw",
                    height: mini ? `min(${MINI.height}px, 82vw / 0.738)` : "100vh",
                    backgroundColor: "var(--pagina-bg)",
                    color: "var(--pagina-texto)",
                    transition: "width 0.8s cubic-bezier(0.65,0,0.35,1), height 0.8s cubic-bezier(0.65,0,0.35,1), background-color 0.3s, color 0.3s",
                    pointerEvents: "none",
                    perspective: 1800,
                }}
                onTransitionEnd={() => {
                    if (fase === "zoom") setFase("pronto");
                }}
            >
                {/* O mesmo ConteudoPadrao renderizado dentro da animação */}
                {ConteudoPadrao}

                {fase === "virando" && (
                    <FolhaVirando onFimAnimacao={() => setFase("pronto")} />
                )}
            </div>

            {(fase === "fechado" || fase === "aberto") && (
                <motion.div
                    className="absolute z-10"
                    style={{
                        width: `min(${MINI.width}px, 82vw)`,
                        height: `min(${MINI.height}px, 82vw / 0.738)`,
                        transformOrigin: "left center",
                        transformStyle: "preserve-3d",
                    }}
                    initial={{ rotateY: 0 }}
                    animate={{ rotateY: fase === "aberto" ? -165 : 0 }}
                    transition={{ type: "spring", stiffness: 210, damping: 24, mass: 1.4 }}
                    onAnimationComplete={() => {
                        if (fase === "aberto") {
                            jaAbriuUmaVez = true;
                            setFase("zoom");
                        }
                    }}
                >
                    <div
                        className="absolute inset-0"
                        style={{
                            backfaceVisibility: "hidden",
                            borderRadius: "2px 6px 6px 2px",
                            background: `
                                radial-gradient(ellipse at 25% 15%, rgba(255,255,255,0.10), transparent 55%),
                                repeating-linear-gradient(115deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 4px),
                                repeating-linear-gradient(25deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 3px),
                                url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.3'/%3E%3C/svg%3E"),
                                linear-gradient(160deg, #8B5A2B, #6B4226)
                            `,
                            boxShadow: "inset 0 1px 1px rgba(255,241,214,0.3), inset 0 -2px 3px rgba(0,0,0,0.45), 6px 10px 30px rgba(0,0,0,0.5)",
                        }}
                    >
                        <div className="absolute" style={{ right: -3, top: 4, bottom: 4, width: 3, background: "#D9C7A8", borderRadius: "0 2px 2px 0" }} />
                        <div className="absolute" style={{ right: -6, top: 8, bottom: 8, width: 3, background: "#CBB694", borderRadius: "0 2px 2px 0" }} />
                        <div className="absolute" style={{ right: -9, top: 12, bottom: 12, width: 3, background: "#BFA77F", borderRadius: "0 2px 2px 0" }} />
                        <div className="h-full flex items-center justify-center">
                            <span className="font-voice italic text-lg px-4 text-center" style={{ color: "#F1E4CC", textShadow: "0 1px 0 rgba(255,241,214,0.2), 0 -1px 1px rgba(0,0,0,0.5)" }}>
                                o caderno do engenheiro
                            </span>
                        </div>
                    </div>

                    <div
                        className="absolute inset-0"
                        style={{
                            backfaceVisibility: "hidden",
                            transform: "rotateY(180deg)",
                            borderRadius: "2px 6px 6px 2px",
                            background: "linear-gradient(160deg, #5B4023, #3E2C18)",
                            boxShadow: "inset 0 0 20px rgba(0,0,0,0.4)",
                        }}
                    />
                </motion.div>
            )}
        </div>
    );
}