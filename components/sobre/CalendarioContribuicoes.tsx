"use client";

import { useLocale, useTranslations } from "next-intl";

function nivelPorContagem(contagem: number): number {
  if (contagem === 0) return 0;
  if (contagem <= 2) return 1;
  if (contagem <= 4) return 2;
  if (contagem <= 6) return 3;
  return 4;
}

// mes: índice 0–11 na semana em que um novo mês começa, null nas demais.
type Semana = { mes: number | null; dias: { contagem: number }[] };

export function CalendarioContribuicoes({ semanas }: { semanas: Semana[] | null }) {
  const t = useTranslations("sobre");
  const locale = useLocale();
  if (!semanas) return <p className="text-sm opacity-60">{t("calendarioErro")}</p>;

  const formatoMes = new Intl.DateTimeFormat(locale === "en" ? "en-US" : "pt-BR", { month: "short" });
  const nomeMes = (mes: number) => formatoMes.format(new Date(2000, mes, 1)).replace(".", "");

  return (
    <div className="w-full flex flex-col calendario-cores">
      
      {/*
        Os cinco níveis são derivados de --accent, então o calendário
        acompanha a paleta ativa sem nenhum JavaScript de tema.
      */}
      <style>{`
        .calendario-cores {
          --cal-0: var(--glass);
          --cal-1: color-mix(in srgb, var(--accent) 25%, var(--bg));
          --cal-2: color-mix(in srgb, var(--accent) 50%, var(--bg));
          --cal-3: color-mix(in srgb, var(--accent) 75%, var(--bg));
          --cal-4: var(--accent);
        }
      `}</style>

      <p className="lbl mb-1.5">{t("atividadeRecente")}</p>
      <p className="heading-3 text-2xl mb-4">{t("calendarioTitulo")}</p>
      
      {/* Container fluído 100% da largura */}
      <div className="w-full overflow-x-auto">
        <div className="w-full flex flex-col gap-1.5 min-w-[640px]">
          
          {/* Rótulos dos Meses */}
          <div className="w-full flex gap-1">
            {semanas.map((s, i) => (
              <div key={i} className="flex-1 text-[9px] opacity-55 whitespace-nowrap font-mono overflow-visible">
                {s.mes !== null ? nomeMes(s.mes) : ""}
              </div>
            ))}
          </div>

          {/* Grid das Semanas */}
          <div className="w-full flex gap-1">
            {semanas.map((s, i) => (
              <div key={i} className="flex-1 flex flex-col gap-1">
                {s.dias.map((d, j) => (
                  <div
                    key={j}
                    className="w-full aspect-square rounded-sm transition-colors duration-300"
                    style={{ backgroundColor: `var(--cal-${nivelPorContagem(d.contagem)})` }}
                  />
                ))}
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Legenda inferior */}
      <div className="flex items-center justify-end gap-1.5 mt-4 text-[9px] opacity-55 font-mono">
        <span>{t("menos")}</span>
        {[0, 1, 2, 3, 4].map((nivel) => (
          <div 
            key={nivel} 
            className="w-[10px] h-[10px] rounded-sm transition-colors duration-300" 
            style={{ backgroundColor: `var(--cal-${nivel})` }} 
          />
        ))}
        <span>{t("mais")}</span>
      </div>
    </div>
  );
}