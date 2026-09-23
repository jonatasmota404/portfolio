"use client";
import { PALETA_UI as PALETA } from "@/lib/paletaUi";

export function DistribuicaoLinguagens({ dados }: { dados: { nome: string; pct: number }[] }) {
  if (dados.length === 0) return <p className="text-sm opacity-60">Sem dado de linguagem suficiente ainda.</p>;

  const [principal] = dados;

  return (
    <div className="flex flex-col justify-between gap-6 h-full">
      <div>
        <p className="lbl">linguagens · uso registrado em projetos pessoais</p>
        <div className="flex items-baseline gap-3 mt-3 flex-wrap">
          <span className="num">{principal.pct}%</span>
          <span className="heading-3 text-xl">{principal.nome}</span>
        </div>
      </div>
      <div>
        <div className="flex w-full h-[18px] rounded-sm overflow-hidden">
          {dados.map((d, i) => <div key={d.nome} style={{ flex: `${d.pct} 0 0`, background: PALETA[i % PALETA.length] }} />)}
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 mt-5">
          {dados.map((d, i) => (
            <div key={d.nome} className="flex items-center gap-2">
              <span className="inline-block w-[3px] h-[13px] rounded-sm" style={{ background: PALETA[i % PALETA.length] }} />
              <span className="text-xs">{d.nome}</span>
              <span className="text-xs opacity-60 font-mono">{d.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
