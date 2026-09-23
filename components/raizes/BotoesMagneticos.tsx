"use client";

import { useEffect } from "react";

export function BotoesMagneticos() {
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return;

    function onMove(e: PointerEvent) {
      document.querySelectorAll<HTMLElement>(".mag").forEach((b) => {
        const r = b.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        const dist = Math.hypot(dx, dy);
        // translateZ(0) fica sempre presente (mesmo em repouso) para manter o botão
        // numa camada composta própria — sem isso, o toggle transform on/off reintroduz
        // o artefato de antialiasing no canto arredondado a cada aproximação do mouse.
        b.style.transform =
          dist < 95
            ? `translate3d(${dx * 0.28}px, ${dy * 0.28}px, 0)`
            : "translateZ(0)";
      });
    }
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return null;
}
