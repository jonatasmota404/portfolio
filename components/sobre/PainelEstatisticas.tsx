"use client";

import { useState } from "react";
import { CalendarioContribuicoes } from "@/components/sobre/CalendarioContribuicoes";
import { DistribuicaoLinguagens } from "@/components/sobre/DistribuicaoLinguagens";
import { NotaMetodologia } from "@/components/sobre/NotaMetodologia";

type Aba = "geral" | "atividade" | "linguagens" | "metodologia";
const ABAS: { id: Aba; rotulo: string }[] = [
  { id: "geral", rotulo: "visão geral" },
  { id: "atividade", rotulo: "atividade recente" },
  { id: "linguagens", rotulo: "linguagens" },
  { id: "metodologia", rotulo: "como isso é contado" },
];

type Stat = { valor: string; rotulo: string };
type Semana = { label: string; dias: { contagem: number }[] };
type Linguagem = { nome: string; pct: number };

type Props = {
  stats: Stat[];
  calendario: Semana[] | null;
  linguagens: Linguagem[];
};

export function PainelEstatisticas({ stats, calendario, linguagens }: Props) {
  const [aba, setAba] = useState<Aba>("geral");

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex gap-2 flex-wrap mb-6">
        {ABAS.map((a) => (
          <button
            key={a.id}
            onClick={() => setAba(a.id)}
            className="text-xs font-mono px-3.5 py-1.5 rounded-full border transition-colors"
            style={{ 
              borderColor: aba === a.id ? "var(--accent)" : "var(--ink)",
              opacity: aba === a.id ? 1 : 0.25,
              color: aba === a.id ? "var(--accent)" : "inherit"
            }}
          >
            {a.rotulo}
          </button>
        ))}
      </div>

      <div className="flex-1 w-full flex flex-col justify-center">
        {aba === "geral" && (
          <div className="grid grid-cols-2 gap-4">
            {stats.map((s) => (
              <div key={s.rotulo} className="painel rounded-xl p-5 shadow-sm">
                <p className="heading-2 text-3xl" style={{ color: "var(--accent)" }}>{s.valor}</p>
                <p className="rotulo mt-1.5">{s.rotulo}</p>
              </div>
            ))}
          </div>
        )}
        {aba === "atividade" && <CalendarioContribuicoes semanas={calendario} />}
        {aba === "linguagens" && <DistribuicaoLinguagens dados={linguagens} />}
        {aba === "metodologia" && <NotaMetodologia />}
      </div>
    </div>
  );
}