"use client";

import { useEffect, useRef } from "react";
import { useZona } from "@/context/ZonaContext";
import { ZONAS, type Zona } from "@/lib/zonas";

function gerarCampoEstrelas(qtd: number, seed: number) {
  const estrelas = [];
  let s = seed;
  for (let i = 0; i < qtd; i++) {
    s = (s * 9301 + 49297) % 233280;
    const r1 = s / 233280;
    s = (s * 9301 + 49297) % 233280;
    const r2 = s / 233280;
    const brilho = i % 11 === 0 ? 0.28 : i % 4 === 0 ? 0.14 : 0.05;
    estrelas.push({ x: r1 * 100, y: r2 * 100, r: brilho });
  }
  return estrelas;
}
const ESTRELAS_FUNDO = gerarCampoEstrelas(160, 42);

const URSA_MAIOR = [[12, 22], [20, 16], [29, 14], [36, 18], [34, 26], [25, 28], [16, 30]];
const URSA_LIGACOES = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]];

const ORION = [[65, 8], [78, 10], [69, 20], [72, 21], [75, 22], [66, 34], [79, 33]];
const ORION_LIGACOES = [[0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6]];

const CRUZEIRO = [[47, 50], [45, 62], [41, 55], [51, 57]];
const CRUZEIRO_LIGACOES = [[0, 1], [2, 3]];

const ORBITAS = [15, 30, 45, 60, 75, 90, 110];
const ROTACAO_ALVO: Record<string, number> = { infra: 0, backend: 280, frontend: 70 };
const VELOCIDADE_DERIVA = 0.00045; // radianos por quadro — ~1 volta a cada 4 minutos

// Variáveis de estado global fora do componente para manter a deriva das estrelas
// contínua mesmo se o layout sofrer re-renderizações de rota.
let anguloAlinhamentoGlobal = 0;
let derivaContinuaGlobal = 0;

export function AmbienteFundo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { zona } = useZona();
  const zonaRef = useRef<Zona>(zona);

  useEffect(() => {
    zonaRef.current = zona;
  }, [zona]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let frameId: number;

    function ajustarTamanho() {
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = window.innerWidth * dpr;
      canvas!.height = window.innerHeight * dpr;
      canvas!.style.width = window.innerWidth + "px";
      canvas!.style.height = window.innerHeight + "px";
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    ajustarTamanho();
    window.addEventListener("resize", ajustarTamanho);

    function corDoTema() {
      return getComputedStyle(document.documentElement).getPropertyValue("--pagina-texto").trim() || "#211D16";
    }

    function corDoFundo() {
      return getComputedStyle(document.documentElement).getPropertyValue("--pagina-bg").trim() || "#E4DCC8";
    }

    function hexParaRgb(hex: string): [number, number, number] {
      const limpo = hex.replace("#", "");
      const r = parseInt(limpo.substring(0, 2), 16);
      const g = parseInt(limpo.substring(2, 4), 16);
      const b = parseInt(limpo.substring(4, 6), 16);
      return [r, g, b];
    }

    function misturarComFundo(corHex: string, fundoHex: string, fator: number): string {
      const [r1, g1, b1] = hexParaRgb(corHex);
      const [r2, g2, b2] = hexParaRgb(fundoHex);
      const r = Math.round(r1 + (r2 - r1) * fator);
      const g = Math.round(g1 + (g2 - g1) * fator);
      const b = Math.round(b1 + (b2 - b1) * fator);
      return `rgb(${r}, ${g}, ${b})`;
    }

    function desenharPonto(x: number, y: number, r: number, cor: string, alfa: number) {
      ctx!.fillStyle = cor;
      ctx!.globalAlpha = alfa;
      ctx!.beginPath();
      ctx!.arc(x - 50, y - 15, r, 0, Math.PI * 2);
      ctx!.fill();
    }

    function desenharConstelacao(pontos: number[][], ligacoes: number[][], ativa: boolean, cor: string, base: string) {
      const corAtual = ativa ? cor : base;
      ligacoes.forEach(([a, b]) => {
        ctx!.strokeStyle = corAtual;
        ctx!.globalAlpha = ativa ? 0.7 : 0.28;
        ctx!.lineWidth = ativa ? 0.16 : 0.07;
        ctx!.beginPath();
        ctx!.moveTo(pontos[a][0] - 50, pontos[a][1] - 15);
        ctx!.lineTo(pontos[b][0] - 50, pontos[b][1] - 15);
        ctx!.stroke();
      });
      pontos.forEach(([x, y]) => {
        desenharPonto(x, y, ativa ? 0.45 : 0.22, corAtual, ativa ? 1 : 0.65);
      });
    }

    function quadro(tempoMs: number) {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const escala = Math.max(w, h) / 100;
      const noite = document.documentElement.classList.contains("night");
      const zonaAtual = zonaRef.current;
      const infraAtiva = zonaAtual === "infra";
      
      const configZona = ZONAS[zonaAtual as keyof typeof ZONAS] || Object.values(ZONAS)[0];
      const corZona = configZona?.cor || "#C1571F";
      
      const base = corDoTema();
      const fundo = corDoFundo();
      const corBase = infraAtiva ? corZona : base;

      const gradePalida = misturarComFundo(corBase, fundo, 0.55);
      const zonaPalida = misturarComFundo(corZona, fundo, 0.2);
      const estrelaPalida = misturarComFundo(base, fundo, 0.5);

      const alvo = ROTACAO_ALVO[zonaAtual] ?? 0;
      anguloAlinhamentoGlobal += (alvo - anguloAlinhamentoGlobal) * 0.04;
      derivaContinuaGlobal += VELOCIDADE_DERIVA;

      ctx!.clearRect(0, 0, w, h);
      ctx!.save();
      ctx!.translate(w / 2, h / 2 - 35 * escala);
      ctx!.rotate((anguloAlinhamentoGlobal * Math.PI) / 180);
      ctx!.scale(escala, escala);

      // Grade do instrumento
      ORBITAS.forEach((raio, i) => {
        ctx!.beginPath();
        ctx!.strokeStyle = gradePalida;
        ctx!.globalAlpha = infraAtiva ? 0.75 : 0.55;
        ctx!.lineWidth = 0.06;
        ctx!.setLineDash(i % 2 === 0 ? [0.5, 0.9] : []);
        ctx!.arc(0, 0, raio, 0, Math.PI * 2);
        ctx!.stroke();
      });
      ctx!.setLineDash([]);

      for (let i = 0; i < 24; i++) {
        ctx!.save();
        ctx!.rotate((i * 15 * Math.PI) / 180);
        ctx!.strokeStyle = gradePalida;
        ctx!.globalAlpha = infraAtiva ? 0.6 : 0.4;
        ctx!.lineWidth = 0.04;
        ctx!.beginPath();
        ctx!.moveTo(0, 0);
        ctx!.lineTo(0, 135);
        ctx!.stroke();
        ctx!.restore();
      }

      // O céu de verdade (constelações + estrelas)
      ctx!.save();
      ctx!.rotate(derivaContinuaGlobal);

      desenharConstelacao(URSA_MAIOR, URSA_LIGACOES, zonaAtual === "backend", zonaPalida, estrelaPalida);
      desenharConstelacao(ORION, ORION_LIGACOES, zonaAtual === "frontend", zonaPalida, estrelaPalida);
      desenharConstelacao(CRUZEIRO, CRUZEIRO_LIGACOES, false, zonaPalida, estrelaPalida);

      ESTRELAS_FUNDO.forEach((estrela, i) => {
        let alfa = 0.45;
        if (noite) {
          alfa = 0.12 + Math.abs(Math.sin(tempoMs / 1000 / (2.5 + (i % 5)) + i)) * 0.75;
        }
        desenharPonto(estrela.x, estrela.y, estrela.r, estrelaPalida, alfa);
      });

      ctx!.restore();
      ctx!.restore();
      ctx!.globalAlpha = 1;
      frameId = requestAnimationFrame(quadro);
    }

    frameId = requestAnimationFrame(quadro);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", ajustarTamanho);
    };
  }, []); // Mantido vazio para que o loop do canvas persista continuamente sem reiniciar ao mudar de zona/idioma

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10 pointer-events-none" aria-hidden="true" />;
}