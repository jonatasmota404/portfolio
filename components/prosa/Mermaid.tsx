"use client";

import { useEffect, useId, useState } from "react";

type MermaidProps = { chart: string };

export function Mermaid({ chart }: MermaidProps) {
  const id = useId().replace(/:/g, "");
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    import("mermaid").then(async (mod) => {
      const mermaid = mod.default;
      mermaid.initialize({ startOnLoad: false, theme: "neutral" });
      const resultado = await mermaid.render(`mermaid-${id}`, chart);
      if (!cancelado) setSvg(resultado.svg);
    });

    return () => {
      cancelado = true;
    };
  }, [chart, id]);

  if (!svg) {
    return (
      <div className="my-8 flex justify-center">
        <p className="text-xs opacity-60">Carregando diagrama…</p>
      </div>
    );
  }

  return <div className="my-8 flex justify-center" dangerouslySetInnerHTML={{ __html: svg }} />;
}