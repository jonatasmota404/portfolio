"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useTema } from "@/context/TemaContext";
import { PALETAS, corThree } from "@/lib/paletas";
import { rng } from "@/lib/raizes";

// Mesmo shader de ponto de CenaRaizes (PV/PF): o visual das partículas bate
// com o campo ambiente da Home.
const PV = 'attribute float aSize;attribute vec3 aCol;attribute float aA;uniform float uScale;varying vec3 vC;varying float vA;void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*mv;float d=max(.1,-mv.z);gl_PointSize=min(90.0,aSize*uScale/d);vC=aCol;vA=aA*exp(-max(0.0,d-10.0)*.018);}';
const PF = 'varying vec3 vC;varying float vA;void main(){vec2 c=gl_PointCoord-.5;float r=length(c)*2.0;float a=1.0-smoothstep(0.0,1.0,r);a*=a;gl_FragColor=vec4(vC,a*vA);}';

// Só o campo de esporos/bokeh da Home, bem mais ralo, lento e apagado, para
// dar profundidade às páginas internas sem competir com a leitura.
const VELOCIDADE = 0.3; // fração da velocidade vertical da Home
const ALTURA = 16; // partículas reaparecem embaixo ao passar de +ALTURA
const INTERVALO_FRAME = 1000 / 30; // movimento lento: 30 fps bastam

export function FundoAmbiente() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { tema } = useTema();
  const temaRef = useRef(tema);
  const redesenharRef = useRef<() => void>(() => {});

  useEffect(() => { temaRef.current = tema; redesenharRef.current(); }, [tema]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const isMob = window.matchMedia("(max-width: 768px)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMob ? 1.25 : 1.5));
    renderer.setClearColor(0x000000, 0);
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 300);
    camera.position.set(0, 0, 32); camera.lookAt(0, 0, 0);
    const uScale = { value: 800 };

    const SN = isMob ? 60 : 110, BK = isMob ? 3 : 6, N = SN + BK;
    const g = new THREE.BufferGeometry();
    const pos = new THREE.BufferAttribute(new Float32Array(N * 3), 3);
    const size = new THREE.BufferAttribute(new Float32Array(N), 1);
    const col = new THREE.BufferAttribute(new Float32Array(N * 3), 3);
    const alpha = new THREE.BufferAttribute(new Float32Array(N), 1);
    g.setAttribute("position", pos); g.setAttribute("aSize", size); g.setAttribute("aCol", col); g.setAttribute("aA", alpha);
    const mat = new THREE.ShaderMaterial({ uniforms: { uScale }, vertexShader: PV, fragmentShader: PF, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const pts = new THREE.Points(g, mat);
    pts.frustumCulled = false;
    scene.add(pts);

    const sr = rng(9);
    const amb = Array.from({ length: N }, (_, i) => {
      const bk = i >= SN;
      return { x: (sr() - 0.5) * (bk ? 76 : 68), y: (sr() - 0.5) * ALTURA * 2, z: bk ? -20 + sr() * 36 : -25 + sr() * 45, s: bk ? 0.9 + sr() * 1.4 : 0.1 + sr() * 0.07, a: bk ? 0.03 + sr() * 0.03 : 0.3, bk, v: 0.2 + sr() * 0.3 };
    });
    amb.forEach((a, i) => { size.setX(i, a.s); alpha.setX(i, a.a); });

    function aplicarCores() {
      const paleta = PALETAS[temaRef.current].scene;
      const spore = corThree(paleta.spore), bokeh = corThree(paleta.bokeh);
      amb.forEach((a, i) => { const c = a.bk ? bokeh : spore; col.setXYZ(i, c.r, c.g, c.b); });
      col.needsUpdate = true;
    }

    function desenhar() {
      amb.forEach((a, i) => pos.setXYZ(i, a.x, a.y, a.z));
      pos.needsUpdate = true;
      renderer.render(scene, camera);
    }

    let temaAplicado = temaRef.current;
    aplicarCores();
    // Com movimento reduzido não há loop: redesenha só quando o tema muda.
    redesenharRef.current = () => { if (reduce) { aplicarCores(); desenhar(); } };

    let frameId = 0;
    let last = performance.now();
    function tick(now: number) {
      frameId = requestAnimationFrame(tick);
      if (now - last < INTERVALO_FRAME) return;
      const dt = Math.min(0.1, (now - last) / 1000); last = now;
      if (temaAplicado !== temaRef.current) { temaAplicado = temaRef.current; aplicarCores(); }
      amb.forEach((a, i) => {
        a.y += dt * a.v * VELOCIDADE * (a.bk ? 0.4 : 1);
        if (a.y > ALTURA) a.y = -ALTURA;
        a.x += Math.sin(now / 1000 * 0.15 + i) * dt * 0.04;
      });
      desenhar();
    }

    function resize() {
      const w = canvas!.clientWidth, h = canvas!.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
      uScale.value = (h * renderer.getPixelRatio()) / (2 * Math.tan((camera.fov * Math.PI) / 360));
      if (reduce) desenhar();
    }
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    desenhar();
    canvas.style.opacity = "1";
    if (!reduce) frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      redesenharRef.current = () => {};
      ro.disconnect();
      g.dispose();
      mat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div aria-hidden className="fixed inset-0 -z-10 pointer-events-none">
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%", opacity: 0, transition: "opacity 0.6s ease" }}
      />
    </div>
  );
}
