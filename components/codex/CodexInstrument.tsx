"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useZona } from "@/context/ZonaContext";
import { ZONAS } from "@/lib/zonas"; // Mantido apenas para herdar descrições ricas (se existirem)

const PALETA_DINAMICA = ["#C1571F", "#5B8770", "#D9C7A8", "#8B5A2B", "#456B5B", "#96AC98"];

function formatarNome(texto: string) {
    if (!texto) return "";
    return texto.split(/[-_]/).map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(" ");
}

function anguloDoEvento(e: MouseEvent | TouchEvent, svg: SVGSVGElement) {
    const rect = svg.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const ponto = "touches" in e ? e.touches[0] : e;
    const x = ponto.clientX - cx;
    const y = ponto.clientY - cy;
    return (Math.atan2(y, x) * 180) / Math.PI + 90;
}

type Props = {
    chips?: string[];
    // Agora o Astrolábio recebe a realidade!
    habilidades?: { zona?: string; tecnologia: string; xp: number; [key: string]: any }[];
};

export function CodexInstrument({ chips, habilidades = [] }: Props) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [angulo, setAngulo] = useState(0);
    const [arrastando, setArrastando] = useState(false);
    const { zona, setZona } = useZona();

    // 1. Cérebro do Astrolábio: Extrai as zonas REAIS que existem nos seus dados
    const zonasReais = useMemo(() => {
        const z = new Set<string>();
        habilidades.forEach(h => z.add(h.zona ? h.zona.toLowerCase() : "geral"));
        const arrayZonas = Array.from(z).sort();
        // Se ainda não carregou habilidades, usa fallback
        return arrayZonas.length > 0 ? arrayZonas : Object.keys(ZONAS);
    }, [habilidades]);

    const numFatias = zonasReais.length || 1;
    const fatiaGraus = 360 / numFatias;

    // Garante que a agulha não aponte para um fantasma
    const zonaAtiva = zona && zonasReais.includes(zona) ? zona : zonasReais[0];
    const indexZona = zonasReais.indexOf(zonaAtiva);

    // 2. Extrai as Tecnologias REAIS daquela zona para os chips
    const techsDaZona = useMemo(() => {
        if (chips) return chips; // Se você quiser forçar algo
        const t = new Set<string>();
        habilidades
            .filter(h => (h.zona ? h.zona.toLowerCase() : "geral") === zonaAtiva)
            .forEach(h => t.add(h.tecnologia));
        const arrayTechs = Array.from(t);
        return arrayTechs.length > 0 
            ? arrayTechs.slice(0, 8) // Mostra no máximo 8 tecnologias para não poluir
            : (ZONAS[zonaAtiva as keyof typeof ZONAS]?.chipsPadrao || []);
    }, [habilidades, zonaAtiva, chips]);

    // 3. Monta os Atributos Visuais Dinamicamente
    const cor = PALETA_DINAMICA[indexZona % PALETA_DINAMICA.length] || "#C1571F";
    const titulo = formatarNome(zonaAtiva);
    
    // Convenção de Texto: Procura no ZONAS. Se não achar, gera um automático!
    const caso = ZONAS[zonaAtiva as keyof typeof ZONAS]?.caso || `Explorações técnicas e mapeamento de artefatos em ${titulo}.`;

    useEffect(() => {
        if (!arrastando) return;

        function mover(e: MouseEvent | TouchEvent) {
            if (!svgRef.current) return;
            const novoAngulo = anguloDoEvento(e, svgRef.current);
            setAngulo(novoAngulo);

            // A Roleta Inteligente: Fatia a pizza em graus matemáticos
            const norm = ((novoAngulo % 360) + 360) % 360;
            const index = Math.floor(norm / fatiaGraus);
            const novaZona = zonasReais[index];

            if (novaZona) setZona(novaZona as any);
        }
        function soltar() {
            setArrastando(false);
        }

        window.addEventListener("mousemove", mover);
        window.addEventListener("mouseup", soltar);
        window.addEventListener("touchmove", mover);
        window.addEventListener("touchend", soltar);

        return () => {
            window.removeEventListener("mousemove", mover);
            window.removeEventListener("mouseup", soltar);
            window.removeEventListener("touchmove", mover);
            window.removeEventListener("touchend", soltar);
        };
    }, [arrastando, setZona, zonasReais, fatiaGraus]);

    return (
        <div className="max-w-sm mx-auto text-center">
            <svg
                ref={svgRef}
                width="260"
                height="260"
                viewBox="0 0 260 260"
                className="mx-auto"
                onMouseDown={() => setArrastando(true)}
                onTouchStart={() => setArrastando(true)}
                style={{ touchAction: "none", cursor: arrastando ? "grabbing" : "grab" }}
            >
                {/* Trono */}
                <path d="M 122 8 A 8 8 0 0 1 138 8" fill="none" stroke="var(--pagina-texto)" strokeWidth={1} opacity={0.55} />
                <circle cx="130" cy="6" r="2.5" fill="none" stroke="var(--pagina-texto)" strokeWidth={0.8} opacity={0.55} />

                {/* Aro externo */}
                <circle cx="130" cy="130" r="112" fill="none" stroke="var(--pagina-texto)" strokeWidth={0.6} />
                {Array.from({ length: 72 }).map((_, i) => {
                    const maior = i % 3 === 0;
                    const ang = (i * 5 * Math.PI) / 180;
                    const rExterno = 112;
                    const rInterno = maior ? 103 : 107;
                    const x1 = 130 + rExterno * Math.sin(ang);
                    const y1 = 130 - rExterno * Math.cos(ang);
                    const x2 = 130 + rInterno * Math.sin(ang);
                    const y2 = 130 - rInterno * Math.cos(ang);
                    return (
                        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--pagina-texto)" strokeWidth={maior ? 0.9 : 0.4} opacity={maior ? 0.65 : 0.3} />
                    );
                })}

                <circle cx="130" cy="130" r="99" fill="none" stroke="var(--pagina-texto)" strokeWidth={0.4} opacity={0.45} />

                {/* Linhas Divisórias - Desenhadas fisicamente de acordo com as zonas reais extraídas */}
                {Array.from({ length: numFatias }).map((_, i) => {
                    const anguloFatia = i * fatiaGraus;
                    const rad = (anguloFatia * Math.PI) / 180;
                    const xBase = 130 + 112 * Math.sin(rad);
                    const yBase = 130 - 112 * Math.cos(rad);
                    const xPonta = 130 + 119 * Math.sin(rad);
                    const yPonta = 130 - 119 * Math.cos(rad);
                    return (
                        <line key={anguloFatia} x1={xBase} y1={yBase} x2={xPonta} y2={yPonta} stroke="var(--pagina-texto)" strokeWidth={1} opacity={0.7} />
                    );
                })}

                {/* Agulha (Alidade) com cor conectada à zona */}
                <g style={{ transformOrigin: "130px 130px", transform: `rotate(${angulo}deg)` }}>
                    <line x1="130" y1="32" x2="130" y2="228" stroke={cor} strokeWidth={1.1} strokeLinecap="round" opacity={0.85} className="transition-colors duration-300" />
                    <circle cx="130" cy="40" r="3.2" fill="none" stroke={cor} strokeWidth={0.9} className="transition-colors duration-300" />
                    <circle cx="130" cy="220" r="3.2" fill="none" stroke={cor} strokeWidth={0.9} opacity={0.4} className="transition-colors duration-300" />
                    <circle cx="130" cy="130" r="5" fill="none" stroke="var(--pagina-texto)" strokeWidth={0.7} />
                    <circle cx="130" cy="130" r="2" fill="var(--pagina-texto)" />
                </g>
            </svg>

            <div className="mt-3 min-h-17.5">
                {/* Título Formatado Automaticamente */}
                <p className="font-voice italic text-lg transition-colors duration-300" style={{ color: cor }}>
                    {titulo}
                </p>
                
                {/* As "Pills" agora vêm direto das suas tecnologias extraídas */}
                <div className="flex gap-1.5 justify-center flex-wrap my-1.5 min-h-[24px]">
                    {techsDaZona.map((c) => (
                        <span key={c} className="text-[10px] font-mono border rounded-full px-2 py-0.5" style={{ borderColor: cor, color: cor }}>
                            {c}
                        </span>
                    ))}
                </div>
                
                {/* Descrição Literária/Dinâmica */}
                <p className="text-xs opacity-70 mt-1">{caso}</p>
            </div>
        </div>
    );
}