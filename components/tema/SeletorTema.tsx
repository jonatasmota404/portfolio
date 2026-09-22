"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { useTema } from "@/context/TemaContext";
import { PALETAS, type TemaId } from "@/lib/paletas";

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
        style={{
          background: `linear-gradient(90deg, ${paletaAtiva.ui.bg} 50%, ${paletaAtiva.ui.accent} 50%)`,
        }}
      />

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
                <span
                  className="tema-swatch"
                  style={{ background: `linear-gradient(90deg, ${p.ui.bg} 50%, ${p.ui.accent} 50%)` }}
                />
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
