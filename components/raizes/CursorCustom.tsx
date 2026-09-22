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

    function onMove(e: PointerEvent) {
      cursor!.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      const alvo = e.target as HTMLElement;
      const grande = !!(alvo.closest && alvo.closest("a, button, input, [data-cursor-big]"));
      cursor!.classList.toggle("big", grande);
    }
    function onLeave() {
      cursor!.style.opacity = "0";
    }
    function onEnter() {
      cursor!.style.opacity = "1";
    }

    window.addEventListener("pointermove", onMove);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    return () => {
      document.body.classList.remove("cursor-custom-on");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
    };
  }, []);

  return <div ref={cursorRef} id="cursor-custom" aria-hidden="true" />;
}
