"use client";

import { useEffect, useRef, useState } from "react";
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
    if (aberto) document.addEventListener("mousedown", aoClicarFora);
    return () => document.removeEventListener("mousedown", aoClicarFora);
  }, [aberto]);

  const paletaAtiva = PALETAS[tema];

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setAberto((v) => !v)}
        aria-label="Escolher tema de cores"
        aria-expanded={aberto}
        className="w-6 h-6 rounded-full border transition-transform hover:scale-110 focus:outline-none"
        style={{
          background: `linear-gradient(90deg, ${paletaAtiva.ui.bg} 50%, ${paletaAtiva.ui.accent} 50%)`,
          borderColor: "var(--line)",
        }}
      />

      {aberto && (
        <div
          className="absolute right-0 mt-2 flex flex-col gap-1 p-2 rounded-2xl border shadow-xl z-50 min-w-[160px]"
          style={{ background: "var(--bg)", borderColor: "var(--line)" }}
        >
          {(Object.keys(PALETAS) as TemaId[]).map((id) => {
            const p = PALETAS[id];
            const ativo = tema === id;
            return (
              <button
                key={id}
                onClick={() => {
                  setTema(id);
                  setAberto(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-full text-xs font-mono whitespace-nowrap transition-colors"
                style={{
                  background: ativo ? p.ui.accent : "transparent",
                  color: ativo ? p.ui.onAccent : "var(--ink)",
                }}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0"
                  style={{
                    background: `linear-gradient(90deg, ${p.ui.bg} 50%, ${p.ui.accent} 50%)`,
                    border: "1px solid rgba(255,255,255,.35)",
                  }}
                />
                {p.nome}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
