"use client";

import dynamic from "next/dynamic";

// ssr:false só é permitido dentro de Client Components; este wrapper deixa o
// layout (Server Component) das páginas internas usar o fundo client-only.
const FundoAmbiente = dynamic(() => import("./FundoAmbiente").then((m) => ({ default: m.FundoAmbiente })), {
  ssr: false,
});

export function FundoAmbienteWrapper() {
  return <FundoAmbiente />;
}
