"use client";

import { useState, useMemo } from "react";
import type { NoHabilidade } from "@/lib/habilidades";
import { PainelEstatisticas } from "./PainelEstatisticas";

type Stat = { valor: string; rotulo: string };
type Semana = { label: string; dias: { contagem: number }[] };
type Linguagem = { nome: string; pct: number };

type Props = {
  habilidades: NoHabilidade[];
  stats: Stat[];
  calendario: Semana[] | null;
  linguagens: Linguagem[];
};

const PALETA_DINAMICA = ["#C1571F", "#5B8770", "#D9C7A8", "#8B5A2B", "#456B5B", "#96AC98"];

function formatarNome(texto: string) {
  if (!texto) return "";
  return texto.split(/[-_]/).map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(" ");
}

// Matemática flexível que desenha desde 1 ponto até infinitos pontos
function calcularPontosRadar(valores: number[], raioMax: number, centro: number, qtdEixosOverride?: number) {
  const qtdEixos = qtdEixosOverride || valores.length;
  return valores
    .map((valor, i) => {
      const angulo = qtdEixos > 1 ? (Math.PI * 2 * i) / qtdEixos - Math.PI / 2 : -Math.PI / 2;
      const x = centro + Math.cos(angulo) * raioMax * valor;
      const y = centro + Math.sin(angulo) * raioMax * valor;
      return `${x},${y}`;
    })
    .join(" ");
}

export function PainelDireito({ habilidades, stats, calendario, linguagens }: Props) {
  // O Estado que controla se estamos na visão Macro ou Micro
  const [zonaAtiva, setZonaAtiva] = useState<string | null>(null);

  // 1. O Cérebro Extrator: Agrupa as habilidades por zona automaticamente
  const { inventario, xpPorZona, zonasUnicas } = useMemo(() => {
    const inv: Record<string, NoHabilidade[]> = {};
    const xp: Record<string, number> = {};

    habilidades.forEach((hab) => {
      const z = hab.zona ? hab.zona.toLowerCase() : "geral";
      if (!inv[z]) inv[z] = [];
      inv[z].push(hab);
      xp[z] = (xp[z] || 0) + hab.xp;
    });

    return { inventario: inv, xpPorZona: xp, zonasUnicas: Object.keys(xp).sort() };
  }, [habilidades]);

  // 2. Motor do Radar: Calcula os eixos baseado no que o usuário clicou
  const maxXP = Math.max(...Object.values(xpPorZona), 1);
  const corAtiva = zonaAtiva ? PALETA_DINAMICA[zonasUnicas.indexOf(zonaAtiva) % PALETA_DINAMICA.length] : "#C1571F";

  const eixosRadar = useMemo(() => {
    if (!zonaAtiva) {
      // MODO MACRO: Os eixos são os domínios reais encontrados
      return zonasUnicas.map((z, idx) => ({
        label: formatarNome(z),
        valor: xpPorZona[z] / maxXP,
      }));
    } else {
      // MODO MICRO: Os eixos são as tecnologias daquela zona específica
      const habsDaZona = inventario[zonaAtiva] || [];
      return habsDaZona.map((hab) => ({
        label: hab.tecnologia,
        valor: hab.xp / 5, // XP base é de 0 a 5
      }));
    }
  }, [zonaAtiva, zonasUnicas, xpPorZona, maxXP, inventario]);

  // Garantimos pelo menos 3 eixos no fundo para manter a aparência de "teia" de radar
  const qtdEixosFundo = Math.max(eixosRadar.length, 3);

  return (
    <div className="mundo-painel border w-full h-full rounded-3xl p-7 lg:p-10 shadow-sm flex flex-col justify-between gap-10">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* LADO ESQUERDO: Radar Dinâmico */}
        <div className="lg:col-span-5 flex flex-col items-center w-full">
          <div className="flex flex-col items-center justify-center min-h-[40px] mb-4">
            <p className="text-[11px] font-mono uppercase tracking-widest opacity-50 text-center transition-all">
              {zonaAtiva ? `Inspeção: ${formatarNome(zonaAtiva)}` : "Status Geral (Macro)"}
            </p>
          </div>

          <div className="relative w-full max-w-[240px] aspect-square rounded-full bg-current/[0.02] flex items-center justify-center border border-current/[0.05]">
            <svg viewBox="0 0 240 240" className="w-full h-full overflow-visible absolute inset-0">
              
              {/* Teias de fundo adaptáveis */}
              {[0.2, 0.4, 0.6, 0.8, 1].map((escala) => (
                <polygon key={escala} points={calcularPontosRadar(Array(qtdEixosFundo).fill(1), 85 * escala, 120, qtdEixosFundo)} fill="none" stroke="currentColor" strokeWidth="0.5" opacity={escala === 1 ? 0.2 : 0.05} />
              ))}
              
              {/* Linhas guias */}
              {Array.from({ length: qtdEixosFundo }).map((_, i) => {
                const angulo = (Math.PI * 2 * i) / qtdEixosFundo - Math.PI / 2;
                return <line key={`eixo-${i}`} x1="120" y1="120" x2={120 + Math.cos(angulo) * 85} y2={120 + Math.sin(angulo) * 85} stroke="currentColor" strokeWidth="0.5" opacity="0.1" />;
              })}
              
              {/* Polígono de Dados */}
              <polygon points={calcularPontosRadar(eixosRadar.map(a => Math.max(a.valor, 0.1)), 85, 120, eixosRadar.length)} fill="var(--pagina-texto)" opacity="0.08" className="transition-all duration-500" />
              <polygon points={calcularPontosRadar(eixosRadar.map(a => Math.max(a.valor, 0.1)), 85, 120, eixosRadar.length)} fill="none" stroke={corAtiva} strokeWidth="2" className="transition-all duration-500" />
              
              {/* Vértices */}
              {eixosRadar.map((a, i) => {
                const angulo = eixosRadar.length > 1 ? (Math.PI * 2 * i) / eixosRadar.length - Math.PI / 2 : -Math.PI / 2;
                const r = 85 * Math.max(a.valor, 0.1);
                return <circle key={`ponto-${i}`} cx={120 + Math.cos(angulo) * r} cy={120 + Math.sin(angulo) * r} r="4.5" fill={corAtiva} className="transition-all duration-500" />;
              })}
            </svg>

            {/* Rótulos orbitais */}
            {eixosRadar.map((a, i) => {
              const angulo = eixosRadar.length > 1 ? (Math.PI * 2 * i) / eixosRadar.length - Math.PI / 2 : -Math.PI / 2;
              const raio = 112; 
              return (
                <div key={`label-${i}`} className="absolute transform -translate-x-1/2 -translate-y-1/2 text-[9px] font-mono whitespace-nowrap opacity-75 text-center transition-all duration-500" style={{ left: `calc(50% + ${Math.cos(angulo) * raio}px)`, top: `calc(50% + ${Math.sin(angulo) * raio}px)` }}>
                  {a.label}
                </div>
              );
            })}
          </div>
        </div>

        {/* LADO DIREITO: Inventário Interativo */}
        <div className="lg:col-span-7 flex flex-col gap-5 w-full border-t lg:border-t-0 lg:border-l border-current/10 pt-8 lg:pt-0 lg:pl-10">
          {habilidades.length === 0 ? (
            <p className="text-sm opacity-60 font-voice italic">Seu inventário está vazio.</p>
          ) : (
            <div className="flex flex-col gap-6 relative">
              
              {/* Botão de resgate para voltar à Visão Macro */}
              {zonaAtiva && (
                <button onClick={() => setZonaAtiva(null)} className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest opacity-50 hover:opacity-100 transition-colors w-fit pb-2 border-b border-current/10">
                  ← Voltar para Visão Macro
                </button>
              )}

              {/* Blocos de Categoria */}
              {zonasUnicas.map((zona, zIndex) => {
                const isAtiva = zonaAtiva === zona;
                const isOutraAtiva = zonaAtiva !== null && !isAtiva;
                const cor = PALETA_DINAMICA[zIndex % PALETA_DINAMICA.length];
                const lista = inventario[zona];

                // Remove completamente os blocos inativos da tela para evitar poluição!
                if (isOutraAtiva) return null;

                return (
                  <div key={zona} className="flex flex-col transition-all duration-300">
                    
                    {/* Botão Categoria */}
                    <button onClick={() => setZonaAtiva(isAtiva ? null : zona)} className="flex items-center gap-2.5 mb-4 group text-left focus:outline-none w-fit">
                      <span className="w-2.5 h-2.5 rounded-full shadow-sm transition-transform group-hover:scale-125" style={{ backgroundColor: cor }} />
                      <h3 className="font-voice italic text-xl opacity-90 group-hover:opacity-100 transition-opacity" style={{ color: cor }}>
                        {formatarNome(zona)}
                      </h3>
                      {!isAtiva && (
                        <span className="opacity-0 group-hover:opacity-40 text-[9px] font-mono uppercase tracking-widest ml-2 transition-opacity">
                          (Inspecionar zona)
                        </span>
                      )}
                    </button>

                    {/* Lista de Tecnologias */}
                    <div className="flex flex-wrap gap-2.5">
                      {lista.map((hab) => (
                        <div key={hab.tecnologia} className={`flex items-center gap-3 px-3.5 py-1.5 rounded-full border text-xs font-mono cursor-default transition-all duration-300 ${hab.status === "aprendendo" ? "border-current/20 border-dashed opacity-60" : "border-current/10 bg-current/[0.02] shadow-sm"} ${isAtiva ? "scale-[1.02] border-current/30 bg-current/[0.04]" : ""}`}>
                          <span className="opacity-90">{hab.tecnologia}</span>
                          <div className="flex gap-0.5 ml-1">
                            {Array.from({ length: 5 }).map((_, idx) => (
                              <span key={idx} className="w-1 h-2 rounded-sm" style={{ backgroundColor: cor, opacity: idx < hab.xp ? 0.9 : 0.15 }} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <hr className="border-current/10 w-full" />
      <div className="w-full flex-1 flex flex-col">
        <PainelEstatisticas stats={stats} calendario={calendario} linguagens={linguagens} />
      </div>
    </div>
  );
}