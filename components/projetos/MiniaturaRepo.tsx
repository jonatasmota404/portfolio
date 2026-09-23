"use client";

import { useId } from "react";

type Props = {
  hue: number; // 0-360, mesma lógica de hash usada em lib/raizes.ts para gerar cor estável por nome
  variante?: "projeto" | "escrito";
};

export function MiniaturaRepo({ hue, variante = "projeto" }: Props) {
  // Mistura determinística entre as cores da paleta ativa: cada item cai num
  // ponto diferente do eixo accent → accent2, sempre dentro da família do tema.
  // As cores vão em `style` (propriedade CSS), não em atributos SVG, para que
  // var()/color-mix() resolvam e acompanhem a troca de tema sem JS.
  const posicaoMix = hue % 100;
  const cor = `color-mix(in srgb, var(--accent) ${100 - posicaoMix}%, var(--accent2) ${posicaoMix}%)`;
  const corClara = `color-mix(in srgb, ${cor} 70%, white)`;
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, ""); // url(#...) não tolera ":" / "«»"

  return (
    <div
      data-variante={variante}
      className="relative w-full aspect-video rounded-2xl overflow-hidden flex items-center justify-center"
      style={{ background: "var(--glass)", border: "1px solid var(--line)" }}
    >
      <svg viewBox="0 0 100 60" className="absolute inset-0 w-full h-full opacity-70">
        <defs>
          <radialGradient id={`glow-${id}`} cx="50%" cy="50%" r="60%">
            <stop offset="0%" style={{ stopColor: corClara, stopOpacity: 0.45 }} />
            <stop offset="100%" style={{ stopColor: corClara, stopOpacity: 0 }} />
          </radialGradient>
          <radialGradient id={`halo-${id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" style={{ stopColor: cor, stopOpacity: 0.55 }} />
            <stop offset="100%" style={{ stopColor: cor, stopOpacity: 0 }} />
          </radialGradient>
        </defs>
        <rect width="100" height="60" fill={`url(#glow-${id})`} />
        <g style={{ stroke: cor }} strokeWidth="0.5" strokeLinecap="round" opacity="0.45">
          <line x1="20" y1="15" x2="50" y2="30" />
          <line x1="80" y1="45" x2="50" y2="30" />
          <line x1="25" y1="48" x2="50" y2="30" />
        </g>
        <g style={{ fill: cor }} opacity="0.7">
          <circle cx="20" cy="15" r="1.5" />
          <circle cx="80" cy="45" r="1.5" />
          <circle cx="25" cy="48" r="1.5" />
        </g>
        <circle cx="50" cy="30" r="12" fill={`url(#halo-${id})`} />
        <circle cx="50" cy="30" r="9" fill="none" style={{ stroke: cor }} strokeWidth="0.6" opacity="0.5" />
        <circle cx="50" cy="30" r="4" style={{ fill: corClara }} />
      </svg>
    </div>
  );
}
