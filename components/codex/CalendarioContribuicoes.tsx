"use client";

function nivelPorContagem(contagem: number): number {
  if (contagem === 0) return 0;
  if (contagem <= 2) return 1;
  if (contagem <= 4) return 2;
  if (contagem <= 6) return 3;
  return 4;
}

type Semana = { label: string; dias: { contagem: number }[] };

export function CalendarioContribuicoes({ semanas }: { semanas: Semana[] | null }) {
  if (!semanas) return <p className="text-sm opacity-60">Não foi possível carregar o calendário agora.</p>;

  return (
    <div className="w-full flex flex-col calendario-cores">
      
      {/* 
        A MÁGICA ACONTECE AQUI: 
        Variáveis CSS processam as cores instantaneamente junto com o carregamento da página, 
        acabando com o "delay" do React e a piscada branca.
      */}
      <style>{`
        .calendario-cores {
          --cal-0: #D8CFB8;
          --cal-1: #C3CDB9;
          --cal-2: #96AC98;
          --cal-3: #6E9580;
          --cal-4: #5B8770;
        }
        html.night .calendario-cores {
          --cal-0: #1C1F27;
          --cal-1: #243830;
          --cal-2: #345247;
          --cal-3: #456B5B;
          --cal-4: #5B8770;
        }
      `}</style>

      <p className="text-[10px] uppercase tracking-widest opacity-50 font-mono mb-1.5">atividade recente</p>
      <p className="font-voice italic text-2xl mb-4">Diário de Contribuições</p>
      
      {/* Container fluído 100% da largura */}
      <div className="w-full overflow-x-auto">
        <div className="w-full flex flex-col gap-1.5 min-w-[640px]">
          
          {/* Rótulos dos Meses */}
          <div className="w-full flex gap-1">
            {semanas.map((s, i) => (
              <div key={i} className="flex-1 text-[9px] opacity-55 whitespace-nowrap font-mono overflow-visible">
                {s.label}
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
        <span>menos</span>
        {[0, 1, 2, 3, 4].map((nivel) => (
          <div 
            key={nivel} 
            className="w-[10px] h-[10px] rounded-sm transition-colors duration-300" 
            style={{ backgroundColor: `var(--cal-${nivel})` }} 
          />
        ))}
        <span>mais</span>
      </div>
    </div>
  );
}