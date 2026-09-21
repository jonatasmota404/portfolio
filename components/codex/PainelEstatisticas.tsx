"use client";

import { useState } from "react";
import { CalendarioContribuicoes } from "@/components/codex/CalendarioContribuicoes";
import { DistribuicaoLinguagens } from "@/components/codex/DistribuicaoLinguagens";
import { NotaMetodologia } from "@/components/codex/NotaMetodologia";

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
              borderColor: aba === a.id ? "#C1571F" : "var(--pagina-texto)", 
              opacity: aba === a.id ? 1 : 0.25, 
              color: aba === a.id ? "#C1571F" : "inherit" 
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
              <div key={s.rotulo} className="mundo-painel border rounded-xl p-5 shadow-sm">
                <p className="font-voice text-3xl">{s.valor}</p>
                <p className="text-xs opacity-60 font-mono mt-1.5">{s.rotulo}</p>
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