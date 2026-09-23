"use client";

import { useMemo, useState } from "react";
import type { NoHabilidade } from "@/lib/habilidades";
import { NotaMetodologia } from "./NotaMetodologia";

function formatarNome(texto: string) {
  if (!texto) return "";
  return texto.split(/[-_]/).map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(" ");
}

// Quanto mais uso, mais destaque: 4 faixas de intensidade sobre var(--accent)
const FAIXAS = [
  { borda: 25, fundo: 6, fonte: "text-[10px]", texto: "opacity-60" },
  { borda: 45, fundo: 10, fonte: "text-[11px]", texto: "opacity-75" },
  { borda: 70, fundo: 15, fonte: "text-xs", texto: "opacity-90" },
  { borda: 100, fundo: 22, fonte: "text-sm", texto: "opacity-100" },
];

function faixaDe(xp: number, xpMax: number) {
  if (xpMax <= 0) return FAIXAS[0];
  const quartil = Math.ceil((xp / xpMax) * FAIXAS.length);
  return FAIXAS[Math.min(FAIXAS.length, Math.max(1, quartil)) - 1];
}

function Chip({
  hab,
  xpMax,
  ativa,
  aoAtivar,
}: {
  hab: NoHabilidade;
  xpMax: number;
  ativa: boolean;
  aoAtivar: (tecnologia: string) => void;
}) {
  const faixa = faixaDe(hab.xp, xpMax);

  return (
    <button
      type="button"
      aria-pressed={ativa}
      onPointerEnter={() => aoAtivar(hab.tecnologia)}
      onFocus={() => aoAtivar(hab.tecnologia)}
      onClick={() => aoAtivar(hab.tecnologia)}
      className={`rounded-full border px-3.5 py-1.5 font-mono uppercase tracking-wider transition-all duration-300 focus:outline-none ${faixa.fonte} ${faixa.texto} ${
        hab.status === "aprendendo" ? "border-dashed" : ""
      } ${ativa ? "scale-[1.04]" : "hover:scale-[1.04]"}`}
      style={{
        borderColor: `color-mix(in srgb, var(--accent) ${faixa.borda}%, transparent)`,
        backgroundColor: `color-mix(in srgb, var(--accent) ${ativa ? faixa.fundo + 12 : faixa.fundo}%, transparent)`,
      }}
    >
      {hab.tecnologia}
    </button>
  );
}

function Secao({
  titulo,
  legenda,
  lista,
  xpMax,
  ativa,
  aoAtivar,
}: {
  titulo: string;
  legenda: string;
  lista: NoHabilidade[];
  xpMax: number;
  ativa: string | null;
  aoAtivar: (tecnologia: string) => void;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex items-baseline gap-2.5 mb-3">
        <h3 className="heading-3 text-lg" style={{ color: "var(--accent)" }}>
          {titulo}
        </h3>
        <span className="lbl">{legenda}</span>
      </div>

      {lista.length === 0 ? (
        <p className="apoio text-sm">Nada por aqui ainda.</p>
      ) : (
        <div className="flex flex-wrap gap-2.5 items-center">
          {lista.map((hab) => (
            <Chip key={hab.tecnologia} hab={hab} xpMax={xpMax} ativa={ativa === hab.tecnologia} aoAtivar={aoAtivar} />
          ))}
        </div>
      )}
    </div>
  );
}

// Conteúdo do bloco de tecnologias do bento de /sobre (o .box fica na página)
export function PainelTecnologias({ habilidades }: { habilidades: NoHabilidade[] }) {
  // Tecnologia em foco (hover, toque ou teclado) cujos usos aparecem no detalhe
  const [ativa, setAtiva] = useState<string | null>(null);

  const { producao, aprendendo, xpMax } = useMemo(
    () => ({
      producao: habilidades.filter((h) => h.status === "producao"),
      aprendendo: habilidades.filter((h) => h.status === "aprendendo"),
      xpMax: Math.max(1, ...habilidades.map((h) => h.xp)),
    }),
    [habilidades]
  );

  const detalhe = ativa ? habilidades.find((h) => h.tecnologia === ativa) ?? null : null;

  function aoAtivar(tecnologia: string) {
    setAtiva((anterior) => (anterior === tecnologia ? null : tecnologia));
  }

  if (habilidades.length === 0) return <p className="apoio text-sm">Seu inventário está vazio.</p>;

  return (
    <div className="flex flex-col gap-6 h-full">
      <Secao
        titulo="Em produção"
        legenda="em uso real"
        lista={producao}
        xpMax={xpMax}
        ativa={ativa}
        aoAtivar={aoAtivar}
      />
      <Secao
        titulo="Aprendendo"
        legenda="em estudo"
        lista={aprendendo}
        xpMax={xpMax}
        ativa={ativa}
        aoAtivar={aoAtivar}
      />

      {/* Detalhe: onde a tecnologia em foco aparece */}
      <div className="min-h-[76px] border-t border-current/10 pt-5 mt-auto">
        {detalhe ? (
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-mono uppercase tracking-widest" style={{ color: "var(--accent)" }}>
              {detalhe.tecnologia}
              <span className="opacity-40 ml-2 normal-case tracking-normal">
                {detalhe.xp} {detalhe.xp === 1 ? "menção" : "menções"}
              </span>
            </p>

            {detalhe.projetos.length > 0 && (
              <p className="text-sm leading-relaxed">
                <span className="text-[10px] font-mono uppercase tracking-widest opacity-40 mr-2">projetos</span>
                <span className="opacity-80">
                  {detalhe.projetos.map((p) => formatarNome(p.nome)).join(" · ")}
                </span>
              </p>
            )}

            {detalhe.artigos.length > 0 && (
              <p className="text-sm leading-relaxed">
                <span className="text-[10px] font-mono uppercase tracking-widest opacity-40 mr-2">escritos</span>
                <span className="opacity-80">
                  {detalhe.artigos.map((a) => a.titulo).join(" · ")}
                </span>
              </p>
            )}

            {detalhe.projetos.length === 0 && detalhe.artigos.length === 0 && (
              <p className="apoio text-sm">Sem usos registrados.</p>
            )}
          </div>
        ) : (
          <p className="apoio text-sm">
            Passe o mouse ou toque numa tecnologia para ver onde ela aparece.
          </p>
        )}
      </div>

      <NotaMetodologia />
    </div>
  );
}
