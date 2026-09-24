"use client";

import { useTranslations } from "next-intl";

type Props = {
  rotulo: string;
  opcoes: string[];
  ativa: string | null;
  aoSelecionar: (valor: string | null) => void;
  formatarRotulo?: (valor: string) => string;
  variante?: "grande" | "pequena";
};

export function FiltroPills({ rotulo, opcoes, ativa, aoSelecionar, formatarRotulo, variante = "grande" }: Props) {
  const t = useTranslations("filtros");
  const formatar = formatarRotulo ?? ((v: string) => v);

  if (variante === "grande") {
    return (
      <div className="flex flex-wrap gap-6 items-baseline border-b border-current/10 pb-5">
        <span className="rotulo mr-2">{rotulo}</span>
        <button
          onClick={() => aoSelecionar(null)}
          className={`font-mono text-sm uppercase tracking-widest transition-all ${ativa === null ? "opacity-100" : "opacity-45 hover:opacity-80"}`}
          style={{ color: ativa === null ? "var(--accent)" : "inherit" }}
        >
          {t("todos")}
        </button>
        {opcoes.map((op) => (
          <button
            key={op}
            onClick={() => aoSelecionar(op)}
            className={`font-mono text-sm uppercase tracking-widest transition-all ${ativa === op ? "opacity-100" : "opacity-45 hover:opacity-80"}`}
            style={{ color: ativa === op ? "var(--accent)" : "inherit" }}
          >
            {formatar(op)}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2.5 items-center">
      <span className="rotulo mr-2">{rotulo}</span>
      {opcoes.map((op) => (
        <button
          key={op}
          onClick={() => aoSelecionar(op === ativa ? null : op)}
          className={`text-[10px] font-mono border rounded-full px-3.5 py-1.5 uppercase tracking-wider transition-all ${
            ativa === op ? "font-bold shadow-sm" : "border-current/20 opacity-60 hover:opacity-100 hover:border-current/40"
          }`}
          style={ativa === op ? { background: "var(--accent)", color: "var(--on-accent)", borderColor: "var(--accent)" } : undefined}
        >
          {formatar(op)}
        </button>
      ))}
    </div>
  );
}
