"use client";

type Props = {
  hue: number; // 0-360, mesma lógica de hash usada em lib/raizes.ts para gerar cor estável por nome
  variante?: "projeto" | "escrito";
};

export function MiniaturaRepo({ hue, variante = "projeto" }: Props) {
  const cor = `hsl(${hue}, 70%, 60%)`;
  const corClara = `hsl(${hue}, 70%, 75%)`;

  return (
    <div
      className="relative w-full aspect-video rounded-2xl overflow-hidden flex items-center justify-center"
      style={{ background: "var(--glass)", border: "1px solid var(--line)" }}
    >
      <svg viewBox="0 0 100 60" className="absolute inset-0 w-full h-full opacity-40">
        <defs>
          <radialGradient id={`glow-${hue}`} cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor={corClara} stopOpacity="0.5" />
            <stop offset="100%" stopColor={corClara} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100" height="60" fill={`url(#glow-${hue})`} />
        <circle cx="50" cy="30" r="4" fill={cor} />
        <circle cx="50" cy="30" r="9" fill="none" stroke={cor} strokeWidth="0.6" opacity="0.6" />
        <line x1="20" y1="15" x2="50" y2="30" stroke={cor} strokeWidth="0.4" opacity="0.4" />
        <line x1="80" y1="45" x2="50" y2="30" stroke={cor} strokeWidth="0.4" opacity="0.4" />
        <line x1="25" y1="48" x2="50" y2="30" stroke={cor} strokeWidth="0.4" opacity="0.4" />
        <circle cx="20" cy="15" r="1.5" fill={cor} opacity="0.6" />
        <circle cx="80" cy="45" r="1.5" fill={cor} opacity="0.6" />
        <circle cx="25" cy="48" r="1.5" fill={cor} opacity="0.6" />
      </svg>
      <span
        className="relative z-10 text-[9px] font-mono uppercase tracking-widest"
        style={{ color: "var(--muted)" }}
      >
        {variante === "projeto" ? "nó do repositório" : "registo de estudo"}
      </span>
    </div>
  );
}
