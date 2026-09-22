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
        b.style.transform = dist < 95 ? `translate(${dx * 0.28}px, ${dy * 0.28}px)` : "";
      });
    }
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return null;
}
