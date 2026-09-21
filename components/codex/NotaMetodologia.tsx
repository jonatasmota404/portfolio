"use client";

import { useState } from "react";

export function NotaMetodologia() {
  const [aberto, setAberto] = useState(false);

  return (
    <div className="pt-3.5 border-t border-current/20">
      <button
        onClick={() => setAberto(!aberto)}
        className="flex items-center gap-2 font-mono text-xs opacity-70 hover:opacity-100"
      >
        <span>como isso é contado</span>
        <span
          className="inline-block border-l-4 border-r-4 border-transparent transition-transform"
          style={{ borderTop: "4px solid #C1571F", transform: aberto ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>
      {aberto && (
        <p className="mt-3 text-sm leading-relaxed italic opacity-80 max-w-md">
          O XP de cada habilidade vem da contagem real de repositórios e artigos marcados com aquela
          tecnologia — nunca autoavaliação. O nível é a soma total desse XP dividida por um fator fixo.
        </p>
      )}
    </div>
  );
}