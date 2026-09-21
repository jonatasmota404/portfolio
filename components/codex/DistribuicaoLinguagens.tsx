"use client";
import { useEffect, useState } from "react";

const PALETA_DIA = ["#4C7A9E", "#5B8770", "#8A6E4B", "#C1571F"];
const PALETA_NOITE = ["#6FA0C4", "#7CA895", "#B0906A", "#E08A4A"];

function useTemaNoturno() {
  const [noite, setNoite] = useState(false);
  useEffect(() => {
    setNoite(document.documentElement.classList.contains("night"));
    const obs = new MutationObserver(() => setNoite(document.documentElement.classList.contains("night")));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return noite;
}

export function DistribuicaoLinguagens({ dados }: { dados: { nome: string; pct: number }[] }) {
  const noite = useTemaNoturno();
  const PALETA = noite ? PALETA_NOITE : PALETA_DIA;

  if (dados.length === 0) return <p className="text-sm opacity-60">Sem dado de linguagem suficiente ainda.</p>;

  return (
    <div>
      <p className="font-voice italic text-xl mb-0.5">Distribuição de Linguagens</p>
      <p className="text-[11px] opacity-60 tracking-wide font-mono">uso registrado em projetos pessoais</p>
      <div className="flex w-full h-[18px] mt-5">
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
  );
}