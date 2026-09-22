"use client";

import { useEffect, useRef } from "react";

export function CursorCustom() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return;

    document.body.classList.add("cursor-custom-on");
    const cursor = cursorRef.current;
    if (!cursor) return;

    // O cursor cresce se QUALQUER uma das fontes de hover estiver ativa —
    // um elemento HTML (link/botão) ou um nó da rede 3D dentro do canvas.
    const sobreElemento = { current: false };
    const sobreNo3D = { current: false };
    function atualizarBig() {
      cursor!.classList.toggle("big", sobreElemento.current || sobreNo3D.current);
    }

    function onMove(e: PointerEvent) {
      cursor!.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      const alvo = e.target as HTMLElement;
      sobreElemento.current = !!(alvo.closest && alvo.closest("a, button, input, [data-cursor-big]"));
      atualizarBig();
    }
    function onLeave() {
      cursor!.style.opacity = "0";
    }
    function onEnter() {
      cursor!.style.opacity = "1";
    }
    function onHoverNode(e: Event) {
      sobreNo3D.current = !!(e as CustomEvent).detail?.hovering;
      atualizarBig();
    }

    window.addEventListener("pointermove", onMove);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    window.addEventListener("raizes:hover-node", onHoverNode);
    return () => {
      document.body.classList.remove("cursor-custom-on");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      window.removeEventListener("raizes:hover-node", onHoverNode);
    };
  }, []);

  return <div ref={cursorRef} id="cursor-custom" aria-hidden="true" />;
}
