"use client";

import { useEffect, useRef, useState } from "react";
import type { CategoriaTecnologia, NivelTecnologia, Tecnologia } from "@/lib/perfil";

const CATEGORIAS: { id: CategoriaTecnologia; pt: string; en: string }[] = [
  { id: "backend", pt: "Backend", en: "Backend" },
  { id: "frontend", pt: "Frontend", en: "Frontend" },
  { id: "infra", pt: "Infra & DevOps", en: "Infra & DevOps" },
  { id: "banco", pt: "Bancos de dados", en: "Databases" },
];

// Proficiência autoavaliada: 1 a 3 pontos
const NIVEIS: Record<NivelTecnologia, { pontos: number; pt: string; en: string }> = {
  aprendendo: { pontos: 1, pt: "Aprendendo", en: "Learning" },
  intermediario: { pontos: 2, pt: "Intermediário", en: "Intermediate" },
  avancado: { pontos: 3, pt: "Avançado", en: "Advanced" },
};

// Se o CDN falhar, os mesmos ícones vêm do repositório de perfil (assets/icons)
const ICONE_FALLBACK = "https://raw.githubusercontent.com/jonatasmota404/jonatasmota404/main/assets/icons";

function aoFalharIcone(img: HTMLImageElement, slug: string) {
  if (img.dataset.fallback) {
    img.style.visibility = "hidden";
    return;
  }
  img.dataset.fallback = "1";
  img.src = `${ICONE_FALLBACK}/${slug}.svg`;
}

// Todas as paletas têm fundo escuro: ícones de marca quase pretos (Next.js) somem,
// então são invertidos quando a luminância média dos pixels visíveis é muito baixa.
function ajustarContraste(img: HTMLImageElement) {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 24;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(img, 0, 0, 24, 24);
    const { data } = ctx.getImageData(0, 0, 24, 24);
    let soma = 0;
    let peso = 0;
    for (let i = 0; i < data.length; i += 4) {
      const alfa = data[i + 3] / 255;
      soma += ((0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255) * alfa;
      peso += alfa;
    }
    if (peso > 0 && soma / peso < 0.2) img.style.filter = "invert(1)";
  } catch {
    // canvas bloqueado por CORS: mantém o ícone como veio
  }
}

function Icone({ tech }: { tech: Tecnologia }) {
  const ref = useRef<HTMLImageElement>(null);

  // A imagem pode carregar (ou falhar) antes da hidratação, sem disparar onLoad/onError
  useEffect(() => {
    const img = ref.current;
    if (!img?.complete) return;
    if (img.naturalWidth > 0) ajustarContraste(img);
    else aoFalharIcone(img, tech.slug);
  }, [tech.slug]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={`https://cdn.simpleicons.org/${tech.slug}`}
      alt={tech.nome}
      width={22}
      height={22}
      crossOrigin="anonymous"
      onLoad={(e) => ajustarContraste(e.currentTarget)}
      onError={(e) => aoFalharIcone(e.currentTarget, tech.slug)}
      className="w-[22px] h-[22px] shrink-0"
    />
  );
}

function Pontos({ nivel }: { nivel: NivelTecnologia }) {
  const { pontos } = NIVEIS[nivel];
  return (
    <span className="flex gap-[3px]" aria-hidden>
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className="w-[5px] h-[5px] rounded-full"
          style={{
            background: n <= pontos ? "var(--accent)" : "transparent",
            border: `1px solid ${n <= pontos ? "var(--accent)" : "var(--line)"}`,
          }}
        />
      ))}
    </span>
  );
}

function Chip({
  tech,
  locale,
  ativa,
  aoAlternar,
}: {
  tech: Tecnologia;
  locale: string;
  ativa: boolean;
  aoAlternar: (slug: string) => void;
}) {
  const nivel = NIVEIS[tech.nivel];
  const rotuloNivel = locale === "en" ? nivel.en : nivel.pt;

  return (
    <button
      type="button"
      aria-expanded={ativa}
      aria-label={`${tech.nome} — ${rotuloNivel}`}
      title={tech.nome}
      onClick={() => aoAlternar(tech.slug)}
      className="flex items-center gap-2.5 rounded-xl border px-2.5 py-2 transition-all duration-300 focus:outline-none focus-visible:ring-2"
      style={{
        background: ativa ? "color-mix(in srgb, var(--accent) 12%, var(--glass))" : "var(--glass)",
        borderColor: ativa ? "color-mix(in srgb, var(--accent) 60%, var(--line))" : "var(--line)",
        ["--tw-ring-color" as string]: "var(--accent)",
      }}
    >
      <Icone tech={tech} />
      <span className="flex flex-col items-start gap-1.5 overflow-hidden">
        {ativa && (
          <span className="text-left leading-tight">
            <span className="block text-sm font-semibold" style={{ color: "var(--ink)" }}>
              {tech.nome}
            </span>
            <span className="block font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--accent)" }}>
              {rotuloNivel}
            </span>
          </span>
        )}
        <Pontos nivel={tech.nivel} />
      </span>
    </button>
  );
}

// Conteúdo do bloco de tecnologias do bento de /sobre (o .box fica na página)
export function StackTecnologias({ tecnologias, locale }: { tecnologias: Tecnologia[]; locale: string }) {
  // Só um chip expandido por vez; clicar no mesmo fecha
  const [ativa, setAtiva] = useState<string | null>(null);

  function aoAlternar(slug: string) {
    setAtiva((anterior) => (anterior === slug ? null : slug));
  }

  const grupos = CATEGORIAS.map((c) => ({
    ...c,
    lista: tecnologias.filter((t) => t.categoria === c.id),
  })).filter((g) => g.lista.length > 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <div className="lbl">stack</div>
        <div className="flex items-center gap-4 flex-wrap">
          {(Object.keys(NIVEIS) as NivelTecnologia[]).reverse().map((n) => (
            <span key={n} className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--muted)" }}>
              <Pontos nivel={n} />
              {locale === "en" ? NIVEIS[n].en : NIVEIS[n].pt}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {grupos.map((g) => (
          <div key={g.id} className="flex flex-col gap-3">
            <h3 className="heading-3 text-base" style={{ color: "var(--accent)" }}>
              {locale === "en" ? g.en : g.pt}
            </h3>
            <div className="flex flex-wrap gap-2 items-start">
              {g.lista.map((tech) => (
                <Chip
                  key={tech.slug}
                  tech={tech}
                  locale={locale}
                  ativa={ativa === tech.slug}
                  aoAlternar={aoAlternar}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
