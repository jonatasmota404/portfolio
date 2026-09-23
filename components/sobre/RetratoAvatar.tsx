"use client";

import { useRef, useState } from "react";

export function RetratoAvatar({ urlFoto }: { urlFoto: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inclinacao, setInclinacao] = useState({ x: 0, y: 0 });

  function mover(e: React.MouseEvent) {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setInclinacao({ x: py * -10, y: px * 10 });
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={mover}
      onMouseLeave={() => setInclinacao({ x: 0, y: 0 })}
      // Adicionado max-w-full e aspect-square para nunca deformar ou estourar o container pai
      className="w-32 h-32 md:w-40 md:h-40 mx-auto md:mx-0 rounded-full overflow-hidden border-2 shrink-0 aspect-square"
      style={{
        borderColor: "var(--accent)",
        transform: `perspective(600px) rotateX(${inclinacao.x}deg) rotateY(${inclinacao.y}deg)`,
        transition: "transform 0.15s ease-out",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={urlFoto} alt="Avatar" className="w-full h-full object-cover" />
    </div>
  );
}