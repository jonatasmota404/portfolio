"use client";

import { useEffect, useRef, useState } from "react";

type CodexPlateProps = {
  titulo?: string;
  viewBox: string;
  children: React.ReactNode;
};

type CodexAnnotationProps = {
  x: number;
  y: number;
  texto: string;
  ancoraX?: number;
  ancoraY?: number;
};

type CodexTracoProps = Omit<React.SVGProps<SVGCircleElement | SVGLineElement | SVGPathElement>, "ref"> & {
  as: "circle" | "line" | "path";
};

export function CodexTraco({ as: Tag, ...props }: CodexTracoProps) {
  return (
    <Tag
      fill="none"
      stroke="var(--ink)"
      strokeWidth={1}
      className="codex-draw"
      {...props}
    />
  );
}

export function CodexPlate({ titulo, viewBox, children }: CodexPlateProps) {
  const ref = useRef<SVGSVGElement>(null);
  const [emVista, setEmVista] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setEmVista(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <svg ref={ref} viewBox={viewBox} role="img" className={emVista ? "codex-em-vista" : ""}>
      {titulo && <title>{titulo}</title>}
      {children}
    </svg>
  );
}

export function CodexAnnotation({ x, y, texto, ancoraX, ancoraY }: CodexAnnotationProps) {
  return (
    <g className="opacity-0 transition-opacity duration-150 group-hover:opacity-100 pointer-events-none">
      {ancoraX !== undefined && ancoraY !== undefined && (
        <line
  x1={ancoraX}
  y1={ancoraY}
  x2={x}
  y2={y - 12}
  strokeWidth={0.5}
  strokeDasharray="2 3"
  stroke="var(--ink)"
  opacity={0.6}
/>
      )}
      <text x={x} y={y} fontSize={12} fill="var(--ink)" fontFamily="var(--font-serif)">
        {texto}
      </text>
    </g>
  );
}