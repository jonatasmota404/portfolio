"use client";

import { useEffect, useRef } from "react";

interface Props {
  texto: string;
}

const PESO_BASE = 300;
const PESO_MAX = 900;
// Raio de influência do ponteiro, em px: além disso a letra volta ao peso base.
const RAIO = 190;

/**
 * Nome do Hero em tipografia cinética: cada letra engorda conforme a
 * proximidade do ponteiro e volta ao peso base quando ele se afasta.
 * O peso é escrito direto no DOM por rAF — sem re-render por frame.
 */
export function NomeCinetico({ texto }: Props) {
  const raizRef = useRef<HTMLHeadingElement>(null);
  const letrasRef = useRef<HTMLSpanElement[]>([]);
  const ponteiro = useRef({ x: -9999, y: -9999 });
  const pesos = useRef<number[]>([]);

  useEffect(() => {
    const letras = letrasRef.current.filter(Boolean);
    if (letras.length === 0) return;

    const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (semMovimento.matches) return;

    pesos.current = letras.map(() => PESO_BASE);
    let centros: Array<{ x: number; y: number }> = [];

    const medir = () => {
      centros = letras.map((el) => {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      });
    };

    const aoMover = (e: PointerEvent) => {
      ponteiro.current = { x: e.clientX, y: e.clientY };
    };
    const aoSair = () => {
      ponteiro.current = { x: -9999, y: -9999 };
    };

    let frame = 0;
    const animar = () => {
      const { x, y } = ponteiro.current;
      for (let i = 0; i < letras.length; i++) {
        const c = centros[i];
        const alvo = c
          ? PESO_BASE +
            (PESO_MAX - PESO_BASE) * Math.max(0, 1 - Math.hypot(x - c.x, y - c.y) / RAIO) ** 2
          : PESO_BASE;
        const atual = pesos.current[i] + (alvo - pesos.current[i]) * 0.16;
        pesos.current[i] = atual;
        letras[i].style.fontWeight = String(Math.round(atual));
      }
      frame = requestAnimationFrame(animar);
    };

    medir();
    frame = requestAnimationFrame(animar);
    window.addEventListener("pointermove", aoMover, { passive: true });
    window.addEventListener("pointerleave", aoSair);
    window.addEventListener("resize", medir);
    window.addEventListener("scroll", medir, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", aoMover);
      window.removeEventListener("pointerleave", aoSair);
      window.removeEventListener("resize", medir);
      window.removeEventListener("scroll", medir);
    };
  }, [texto]);

  return (
    <h1 ref={raizRef} className="raizes-nome" aria-label={texto}>
      {texto.split("").map((ch, i) => (
        <span
          key={`${ch}-${i}`}
          aria-hidden="true"
          ref={(el) => {
            if (el) letrasRef.current[i] = el;
          }}
        >
          {ch === " " ? " " : ch}
        </span>
      ))}
    </h1>
  );
}
