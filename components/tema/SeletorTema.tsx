"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { useTema } from "@/context/TemaContext";
import { PALETAS, type TemaId } from "@/lib/paletas";

function SwatchTema({ bg, accent, tamanho }: { bg: string; accent: string; tamanho: number }) {
  return (
    <span
      style={{
        position: "relative",
        display: "block",
        width: tamanho,
        height: tamanho,
        borderRadius: "50%",
        overflow: "hidden",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,.35)",
        flexShrink: 0,
      }}
    >
      <span style={{ position: "absolute", inset: 0, background: bg }} />
      <span style={{ position: "absolute", inset: "0 0 0 50%", background: accent }} />
    </span>
  );
}

export function SeletorTema() {
  const { tema, setTema } = useTema();
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function aoClicarFora(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === "Escape") setAberto(false);
    }
    if (aberto) {
      document.addEventListener("mousedown", aoClicarFora);
      document.addEventListener("keydown", aoTeclar);
    }
    return () => {
      document.removeEventListener("mousedown", aoClicarFora);
      document.removeEventListener("keydown", aoTeclar);
    };
  }, [aberto]);

  const paletaAtiva = PALETAS[tema];

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setAberto((v) => !v)}
        aria-label="Escolher paleta de cores"
        aria-expanded={aberto}
        aria-haspopup="menu"
        className="tema-gatilho foco-anel"
      >
        <SwatchTema bg={paletaAtiva.ui.bg} accent={paletaAtiva.ui.accent} tamanho={24} />
      </button>

      {aberto && (
        <div className="tema-menu" role="menu">
          <span className="tema-rotulo">paleta</span>
          {(Object.keys(PALETAS) as TemaId[]).map((id) => {
            const p = PALETAS[id];
            const ativo = tema === id;
            return (
              <button
                key={id}
                role="menuitemradio"
                aria-checked={ativo}
                data-ativo={ativo}
                onClick={() => {
                  setTema(id);
                  setAberto(false);
                }}
                className="tema-item foco-anel"
                style={
                  ativo
                    ? { background: p.ui.accent, color: p.ui.onAccent }
                    : undefined
                }
              >
                <SwatchTema bg={p.ui.bg} accent={p.ui.accent} tamanho={19} />
                {p.nome}
                <Check size={14} className="tema-check" strokeWidth={3} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
