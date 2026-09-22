"use client";

import { useEffect, useRef } from "react";

interface Props {
  texto: string;
}

const PESO_MIN = 200;
const PESO_GANHO = 700;
// Raio de influência do ponteiro, em px: além disso a letra volta ao peso mínimo.
const RAIO = 260;
// Achata o eixo vertical: o efeito é mais sensível ao movimento horizontal do mouse.
const FATOR_Y = 0.45;
const SUAVIZACAO = 0.14;
// Onda automática (sem mouse ativo / touch): peso oscila em torno desse centro.
const ONDA_BASE = 560;
const ONDA_AMPLITUDE = 340;
const ONDA_VELOCIDADE = 800;
const ONDA_DEFASAGEM = 0.7;

/**
 * Nome do Hero em tipografia cinética: cada letra engorda conforme a
 * proximidade do ponteiro (mouse) e volta a ondular sozinha quando não
 * há mouse ativo (idle ou touch). O peso é escrito direto no DOM por
 * rAF — sem re-render por frame.
 */
export function NomeCinetico({ texto }: Props) {
  const raizRef = useRef<HTMLHeadingElement>(null);
  const letrasRef = useRef<HTMLSpanElement[]>([]);
  const ponteiro = useRef({ x: -9999, y: -9999 });
  const ponteiroAtivo = useRef(false);
  const pesos = useRef<number[]>([]);

  useEffect(() => {
    const letras = letrasRef.current.filter(Boolean);
    if (letras.length === 0) return;

    const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (semMovimento.matches) {
      letras.forEach((el) => {
        el.style.fontWeight = "600";
      });
      return;
    }

    pesos.current = letras.map(() => PESO_MIN);
    let centros: Array<{ x: number; y: number }> = [];

    const medir = () => {
      centros = letras.map((el) => {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      });
    };

    const aoMover = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      ponteiro.current = { x: e.clientX, y: e.clientY };
      ponteiroAtivo.current = true;
    };
    const aoSair = () => {
      ponteiroAtivo.current = false;
    };

    let frame = 0;
    const animar = (tempoMs: number) => {
      for (let i = 0; i < letras.length; i++) {
        let alvo: number;
        if (ponteiroAtivo.current) {
          const c = centros[i];
          const dx = ponteiro.current.x - c.x;
          const dy = (ponteiro.current.y - c.y) * FATOR_Y;
          const distancia = Math.hypot(dx, dy);
          alvo = PESO_MIN + PESO_GANHO * Math.max(0, 1 - distancia / RAIO);
        } else {
          alvo = ONDA_BASE + ONDA_AMPLITUDE * Math.sin(tempoMs / ONDA_VELOCIDADE - i * ONDA_DEFASAGEM);
        }
        const atual = pesos.current[i] + (alvo - pesos.current[i]) * SUAVIZACAO;
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
    <h1 ref={raizRef} className="raizes-h1 raizes-kinetic" aria-label={texto}>
      {/* Uma linha flex: o nbsp acima preserva a largura do espaço entre as palavras. */}
      <span className="raizes-kinetic-linha">
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
      </span>
    </h1>
  );
}
