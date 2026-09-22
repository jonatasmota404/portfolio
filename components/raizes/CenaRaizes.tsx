"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useTema } from "@/context/TemaContext";
import { PALETAS, corThree, type PaletaScene } from "@/lib/paletas";
import type { NoRepo } from "@/lib/raizes";

type CameraAlvo = {
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
};

interface Props {
  nos: NoRepo[];
  ligacoes: Array<{ a: string; b: string; forte: boolean }>;
  camAlvo: React.RefObject<CameraAlvo>;
}

type TooltipInfo = { nome: string; tags: string[]; commits: number; conecta: string[] } | null;

const MIN_NOS_TOTAL = 74;

function rng(a: number) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PV = 'attribute float aSize;attribute vec3 aCol;attribute float aA;uniform float uScale;varying vec3 vC;varying float vA;void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*mv;float d=max(.1,-mv.z);gl_PointSize=min(90.0,aSize*uScale/d);vC=aCol;vA=aA*exp(-max(0.0,d-10.0)*.018);}';
const PF = 'varying vec3 vC;varying float vA;void main(){vec2 c=gl_PointCoord-.5;float r=length(c)*2.0;float a=1.0-smoothstep(0.0,1.0,r);a*=a;gl_FragColor=vec4(vC,a*vA);}';
const LV = 'attribute float aDay;attribute float aTaper;attribute float aBr;attribute float aPh;attribute float aDyn;uniform float uT;uniform float uTime;varying float vA;void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*mv;float g=smoothstep(aDay,aDay+10.0,uT);float sh=.78+.22*sin(uTime*1.7+aPh*6.283+position.x*.6);float d=max(.1,-mv.z);vA=g*aTaper*aBr*aDyn*sh*exp(-max(0.0,d-10.0)*.02);}';
const LF = 'uniform vec3 uCol;varying float vA;void main(){gl_FragColor=vec4(uCol,vA);}';
const SV = 'varying vec3 vN;varying vec3 vV;void main(){vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.0);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}';
const SF = 'uniform vec3 uCol;uniform float uI;varying vec3 vN;varying vec3 vV;void main(){float f=pow(1.0-abs(dot(vN,vV)),2.2);gl_FragColor=vec4(uCol,f*uI);}';

function glowTex(): THREE.CanvasTexture {
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const x = c.getContext("2d")!, g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.25, "rgba(255,255,255,.55)"); g.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

function mkPts(N: number, uScale: { value: number }) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 3), 3));
  g.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array(N), 1));
  g.setAttribute("aCol", new THREE.BufferAttribute(new Float32Array(N * 3), 3));
  g.setAttribute("aA", new THREE.BufferAttribute(new Float32Array(N), 1));
  const mat = new THREE.ShaderMaterial({ uniforms: { uScale }, vertexShader: PV, fragmentShader: PF, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const p = new THREE.Points(g, mat) as unknown as THREE.Points & {
    set: (i: number, x: number, y: number, z: number, s: number, r: number, gg: number, b: number, a: number) => void;
    flush: () => void;
  };
  p.frustumCulled = false;
  p.set = (i, x, y, z, s, r, gg, b, a) => {
    const A = g.attributes;
    (A.position as THREE.BufferAttribute).setXYZ(i, x, y, z);
    (A.aSize as THREE.BufferAttribute).setX(i, s);
    (A.aCol as THREE.BufferAttribute).setXYZ(i, r, gg, b);
    (A.aA as THREE.BufferAttribute).setX(i, a);
  };
  p.flush = () => {
    const A = g.attributes;
    (A.position as THREE.BufferAttribute).needsUpdate = true;
    (A.aSize as THREE.BufferAttribute).needsUpdate = true;
    (A.aCol as THREE.BufferAttribute).needsUpdate = true;
    (A.aA as THREE.BufferAttribute).needsUpdate = true;
  };
  return p;
}

function taperTube(curve: THREE.Curve<THREE.Vector3>, segs: number, rad: number, radial: number) {
  const geo = new THREE.TubeGeometry(curve, segs, rad, radial, false);
  const pa = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i <= segs; i++) {
    const c = curve.getPointAt(i / segs);
    const f = 0.3 + 0.7 * Math.pow(1 - i / segs, 1.1);
    for (let j = 0; j <= radial; j++) {
      const k = i * (radial + 1) + j;
      pa.setXYZ(k, c.x + (pa.getX(k) - c.x) * f, c.y + (pa.getY(k) - c.y) * f, c.z + (pa.getZ(k) - c.z) * f);
    }
  }
  return geo;
}

type NodeInterno = { p: THREE.Vector3; repoIndex: number; edges: number[]; state: "ok" | "half" | "open"; t0: number; born: boolean; birth: number };
type EdgeInterno = { a: number; b: number; A: number; B: number; curve: THREE.CubicBezierCurve3; len: number; strong: boolean; day0: number; day1: number; dyn: number; hl: number; hv: number; o: number; n: number; tube?: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial> };

function gerarPosicoes(nos: NoRepo[], rr: () => number): THREE.Vector3[] {
  const out: THREE.Vector3[] = new Array(nos.length);
  const destaques = nos.map((n, i) => ({ n, i })).filter((x) => x.n.destaque);
  const outros = nos.map((n, i) => ({ n, i })).filter((x) => !x.n.destaque);
  const GOLDEN = Math.PI * (3 - Math.sqrt(5));
  destaques.forEach((d, k) => {
    const ang = k * GOLDEN;
    const t = destaques.length > 1 ? k / (destaques.length - 1) : 0.5;
    const raio = 6 + t * 22;
    out[d.i] = new THREE.Vector3(Math.cos(ang) * raio, (rr() - 0.5) * 10, Math.sin(ang) * raio * 0.6);
  });
  outros.forEach((d, k) => {
    const base = destaques.length ? out[destaques[k % destaques.length].i] : new THREE.Vector3(0, 0, 0);
    out[d.i] = base.clone().add(new THREE.Vector3((rr() - 0.5) * 10, (rr() - 0.5) * 6, (rr() - 0.5) * 10));
  });
  return out;
}

export function CenaRaizes({ nos, ligacoes, camAlvo }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { tema } = useTema();
  const temaRef = useRef(tema);
  const [tooltip, setTooltip] = useState<TooltipInfo>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const applyPaletteRef = useRef<(scene: PaletaScene) => void>(() => {});

  useEffect(() => { temaRef.current = tema; applyPaletteRef.current(PALETAS[tema].scene); }, [tema]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const isMob = window.matchMedia("(max-width: 768px)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMob, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMob ? 1.5 : 2));
    renderer.setClearColor(0x000000, 0);
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 300);
    const camPos = new THREE.Vector3(0, 30, 50), camLook = new THREE.Vector3(0, 0, 0);
    camera.position.copy(camPos); camera.lookAt(camLook);

    const glow = glowTex();
    const uScale = { value: 800 };

    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const pl = new THREE.PointLight(0xffffff, 0.8); pl.position.set(30, 50, 30); scene.add(pl);

    // ---- construção da rede ----
    const seedTxt = nos.map((n) => n.id).join("|");
    let seed = 0; for (let i = 0; i < seedTxt.length; i++) seed = (seed * 31 + seedTxt.charCodeAt(i)) | 0;
    const rr = rng(seed || 4242);

    const posicoes = gerarPosicoes(nos, rr);
    const nodes: NodeInterno[] = nos.map((n, i) => ({ p: posicoes[i], repoIndex: i, edges: [], state: "ok", t0: 0, born: true, birth: n.nascimento }));

    const alvoTotal = Math.max(MIN_NOS_TOTAL, nos.length);
    const M0 = alvoTotal - nos.length;
    for (let tries = 0; nodes.length < nos.length + M0 && tries < 8000; tries++) {
      const v = new THREE.Vector3((rr() - 0.5) * 60, (rr() - 0.5) * 18, (rr() - 0.5) * 40);
      if (nodes.every((n) => n.p.distanceTo(v) > 2.4)) {
        let bi = 0, bd = 1e9;
        for (let i = 0; i < nos.length; i++) { const d = nodes[i].p.distanceTo(v); if (d < bd) { bd = d; bi = i; } }
        nodes.push({ p: v, repoIndex: -1, edges: [], state: "ok", t0: 0, born: true, birth: Math.min(360, Math.min(nodes[bi]?.birth ?? 0, 330) + 8 + Math.floor(rr() * 90) + bd * 3) });
      }
    }

    const edges: EdgeInterno[] = [];
    const seen = new Set<string>();
    function addEdge(a: number, b: number, strong: boolean) {
      const k = a < b ? `${a}-${b}` : `${b}-${a}`;
      if (seen.has(k) || a === b) return;
      seen.add(k);
      let A = a, B = b;
      if (nodes[A].birth > nodes[B].birth) { A = b; B = a; }
      const pa = nodes[A].p, pb = nodes[B].p, d = pa.distanceTo(pb);
      const off = () => new THREE.Vector3(rr() - 0.5, rr() - 0.5, rr() - 0.5).multiplyScalar(d * 0.55);
      const curve = new THREE.CubicBezierCurve3(pa, pa.clone().lerp(pb, 0.33).add(off()), pa.clone().lerp(pb, 0.66).add(off()), pb);
      // Nós secundários (repoIndex < 0) só recebem um ponto fraco (secP), sem
      // núcleo brilhante (core/shell/halo). Uma aresta entre dois secundários
      // nasceria sem nenhum ponto aceso visível em nenhuma ponta — atrasamos
      // essas arestas para que sempre apareçam depois de algum nó real (com
      // núcleo) já estar aceso por perto.
      const ambosSecundarios = nodes[A].repoIndex < 0 && nodes[B].repoIndex < 0;
      const atraso = ambosSecundarios ? 20 : 0;
      edges.push({ a, b, A, B, curve, len: curve.getLength(), strong, day0: nodes[A].birth + atraso, day1: Math.min(400, nodes[B].birth + 22 + atraso), dyn: 1, hl: 0, hv: 0, o: 0, n: 0 });
      nodes[a].edges.push(edges.length - 1); nodes[b].edges.push(edges.length - 1);
    }

    const idxPorId = new Map(nos.map((n, i) => [n.id, i]));
    ligacoes.forEach((l) => {
      const ia = idxPorId.get(l.a), ib = idxPorId.get(l.b);
      if (ia !== undefined && ib !== undefined) addEdge(ia, ib, l.forte);
    });
    nodes.forEach((n, i) => {
      const ds = nodes.map((m, j) => [j, n.p.distanceTo(m.p)] as [number, number]).filter((x) => x[0] !== i).sort((a, b) => a[1] - b[1]);
      for (let k = 0; k < (n.repoIndex >= 0 ? 3 : 2); k++) if (ds[k]) addEdge(i, ds[k][0], false);
    });

    const S = 18;
    const P: number[] = [], DAY: number[] = [], TAP: number[] = [], BR: number[] = [], PH: number[] = [];
    const seg = (p: THREE.Vector3, q: THREE.Vector3, d0: number, d1: number, t0: number, t1: number, br: number, ph: number) => {
      P.push(p.x, p.y, p.z, q.x, q.y, q.z); DAY.push(d0, d1); TAP.push(t0, t1); BR.push(br, br); PH.push(ph, ph);
    };
    function grow(p: THREE.Vector3, dir: THREE.Vector3, len: number, depth: number, d0: number, ph: number) {
      let cur = p.clone(); const d = dir.clone(); const N = 4; const pts = [cur.clone()];
      for (let k = 0; k < N; k++) {
        d.add(new THREE.Vector3(rr() - 0.5, rr() - 0.5, rr() - 0.5).multiplyScalar(0.5)).normalize();
        cur = cur.clone().addScaledVector(d, len / N); pts.push(cur.clone());
        if (depth < 2 && k === 1 && rr() < 0.8) {
          grow(cur, d.clone().add(new THREE.Vector3(rr() - 0.5, rr() - 0.5, rr() - 0.5)).normalize(), len * 0.55, depth + 1, d0 + 4, ph);
        }
      }
      const tp2 = (u: number) => Math.pow(1 - u, 1.2) * (depth ? 0.55 : 0.8);
      for (let k = 0; k < N; k++) { const u0 = k / N, u1 = (k + 1) / N; seg(pts[k], pts[k + 1], d0 + u0 * 9, d0 + u1 * 9, tp2(u0), tp2(u1), 0.45, ph); }
    }
    edges.forEach((e) => {
      e.o = DAY.length;
      const pts = e.curve.getPoints(S); const ph = rr();
      const tap = (u: number) => 0.55 + 0.45 * Math.abs(Math.cos(Math.PI * u));
      for (let k = 0; k < S; k++) { const u0 = k / S, u1 = (k + 1) / S; seg(pts[k], pts[k + 1], e.day0 + (e.day1 - e.day0) * u0, e.day0 + (e.day1 - e.day0) * u1, tap(u0), tap(u1), e.strong ? 0.95 : 0.5, ph); }
      e.n = S * 2;
      const nb = e.strong ? (isMob ? 4 : 8) : (isMob ? 1 : 3);
      for (let b = 0; b < nb; b++) {
        const t = 0.12 + rr() * 0.76; const pt = e.curve.getPoint(t); const tg = e.curve.getTangent(t);
        const dir = new THREE.Vector3(rr() - 0.5, rr() - 0.5, rr() - 0.5).normalize().addScaledVector(tg, 0.3).normalize();
        grow(pt, dir, e.len * (0.09 + rr() * 0.14), 0, e.day0 + (e.day1 - e.day0) * t + 4, ph);
      }
    });

    const lg = new THREE.BufferGeometry();
    const NV = DAY.length; const DYN = new Float32Array(NV).fill(1);
    lg.setAttribute("position", new THREE.Float32BufferAttribute(P, 3));
    lg.setAttribute("aDay", new THREE.Float32BufferAttribute(DAY, 1));
    lg.setAttribute("aTaper", new THREE.Float32BufferAttribute(TAP, 1));
    lg.setAttribute("aBr", new THREE.Float32BufferAttribute(BR, 1));
    lg.setAttribute("aPh", new THREE.Float32BufferAttribute(PH, 1));
    lg.setAttribute("aDyn", new THREE.BufferAttribute(DYN, 1));
    const lineMat = new THREE.ShaderMaterial({ uniforms: { uT: { value: 364 }, uTime: { value: 0 }, uCol: { value: new THREE.Color(0.91, 0.89, 0.8) } }, vertexShader: LV, fragmentShader: LF, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const lines = new THREE.LineSegments(lg, lineMat); lines.frustumCulled = false; scene.add(lines);

    edges.forEach((e) => {
      if (!e.strong) return;
      e.tube = new THREE.Mesh(taperTube(e.curve, 40, isMob ? 0.05 : 0.06, 6), new THREE.MeshBasicMaterial({ color: 0xe8e4d4, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }));
      e.tube.frustumCulled = false; scene.add(e.tube);
    });

    const mistSprites: THREE.Sprite[] = [];
    ([[-14, -2, -14, 34], [12, 3, -18, 40], [0, -4, -6, 30], [4, 6, -22, 46]] as const).forEach((a) => {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: 0x0f4a34, transparent: true, opacity: 0.32, blending: THREE.AdditiveBlending, depthWrite: false }));
      s.position.set(a[0], a[1], a[2]); s.scale.set(a[3], a[3], 1); scene.add(s); mistSprites.push(s);
    });

    type NucleoVis = { core: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>; shell: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>; halo: THREE.Sprite; rings: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>[]; hit: THREE.Mesh };
    const maxCommits = Math.max(1, ...nos.map((n) => n.commits));
    const rn: NucleoVis[] = nos.map((n, i) => {
      const escala = n.commits / maxCommits;
      const s = n.destaque ? 0.45 + 0.35 * escala : 0.22 + 0.12 * escala;
      const p = nodes[i].p;
      const core = new THREE.Mesh(new THREE.SphereGeometry(s, 20, 16), new THREE.MeshBasicMaterial({ color: 0xfff0c8 })); core.position.copy(p);
      const shell = new THREE.Mesh(new THREE.SphereGeometry(s * 1.75, 24, 18), new THREE.ShaderMaterial({ uniforms: { uCol: { value: new THREE.Color(1, 0.81, 0.4) }, uI: { value: 0.8 } }, vertexShader: SV, fragmentShader: SF, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); shell.position.copy(p);
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: 0xffcf66, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); halo.position.copy(p);
      const rings: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>[] = [];
      for (let q = 0; q < (n.destaque ? 3 : 1); q++) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(s * (2.2 + q * 0.75), 0.018, 6, 64), new THREE.MeshBasicMaterial({ color: 0xe8e4d4, transparent: true, opacity: 0.42 - q * 0.08, blending: THREE.AdditiveBlending, depthWrite: false }));
        ring.position.copy(p); ring.rotation.x = 1.1 + q * 0.4; rings.push(ring); scene.add(ring);
      }
      const hit = new THREE.Mesh(new THREE.SphereGeometry(n.destaque ? 1.8 : 1.2, 10, 8), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })); hit.position.copy(p);
      scene.add(core, shell, halo, hit);
      return { core, shell, halo, rings, hit };
    });

    const secundarios = nodes.filter((n) => n.repoIndex < 0);
    const secP = mkPts(Math.max(1, secundarios.length), uScale); scene.add(secP);
    const PN = isMob ? 26 : 46, TR = 6;
    const dynP = mkPts(PN * (TR + 1), uScale); scene.add(dynP);
    const SN = isMob ? 140 : 300, BK = isMob ? 8 : 20;
    const ambP = mkPts(SN + BK, uScale); scene.add(ambP);
    const sr = rng(9);
    const amb = Array.from({ length: SN + BK }, (_, i) => {
      const bk = i >= SN;
      return { x: (sr() - 0.5) * (bk ? 70 : 60), y: (sr() - 0.5) * (bk ? 26 : 22), z: bk ? -20 + sr() * 44 : -25 + sr() * 50, s: bk ? 0.9 + sr() * 1.4 : 0.1 + sr() * 0.07, a: bk ? 0.05 + sr() * 0.05 : 0.55, bk, v: 0.2 + sr() * 0.3 };
    });
    const pulses = Array.from({ length: PN }, () => ({ e: -1, dir: 1, t: 0, v: 0.3, big: false }));

    const okN = (n: number) => nodes[n].state !== "open" && nodes[n].born;
    function spawnPulse(p: { e: number; dir: number; t: number; v: number; big: boolean }, from?: number, big?: boolean) {
      for (let k = 0; k < 40; k++) {
        const n = from != null ? from : Math.floor(Math.random() * nodes.length);
        if (!okN(n)) { if (from != null) break; continue; }
        const cand = nodes[n].edges.filter((ei) => { const e = edges[ei]; const o = e.a === n ? e.b : e.a; return okN(o); });
        if (!cand.length) { if (from != null) break; continue; }
        const ei = cand[Math.floor(Math.random() * cand.length)]; const e = edges[ei];
        p.e = ei; p.dir = e.A === n ? 1 : -1; p.t = 0; p.v = (big ? 5 : 2.4 + Math.random() * 3.4) / e.len; p.big = !!big; return;
      }
      p.e = -1;
    }
    pulses.forEach((p) => { spawnPulse(p); p.t = Math.random(); });

    // Começa em ~6 "dias" (não 0) para que o filamento do primeiro nó já tenha
    // opacidade visível (smoothstep > 0) no exato frame em que o canvas é revelado
    // (ver primeiroFrame/canvas.style.opacity abaixo, que resolve o resto do atraso:
    // tempo de montagem do componente via next/dynamic e de inicialização do WebGL).
    const tempoAberturaRef = { current: 0.12 };
    let hoverRepo = -1;
    const raycaster = new THREE.Raycaster();

    // Controle de depuração da abertura: "P" pausa/despausa o avanço do tempo
    // de abertura; com pausado, "←"/"→" avançam manualmente em passos de 0.05.
    // Fica atrás de ?debug na URL para não interferir com o uso normal do site.
    const debugAtivo = window.location.search.includes("debug");
    let aberturaPausada = false;
    function handleDebugKey(e: KeyboardEvent) {
      if (e.key === "p" || e.key === "P") { aberturaPausada = !aberturaPausada; return; }
      if (!aberturaPausada) return;
      if (e.key === "ArrowRight") { tempoAberturaRef.current += 0.05; }
      else if (e.key === "ArrowLeft") { tempoAberturaRef.current = Math.max(0, tempoAberturaRef.current - 0.05); }
      else return;
      const uTDebug = Math.min(400, (tempoAberturaRef.current / 8) * 400);
      console.log(`[raizes] tempoAbertura=${tempoAberturaRef.current.toFixed(3)} uT=${uTDebug.toFixed(1)}`);
    }
    if (debugAtivo) window.addEventListener("keydown", handleDebugKey);

    function pickRepo(clientX: number, clientY: number): number {
      const rect = canvas!.getBoundingClientRect();
      const mx = ((clientX - rect.left) / rect.width) * 2 - 1;
      const my = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera({ x: mx, y: my } as THREE.Vector2, camera);
      const hits = rn.map((r, i) => ({ mesh: r.hit, i })).filter((h) => nodes[h.i].born);
      const inter = raycaster.intersectObjects(hits.map((h) => h.mesh), false)[0];
      if (!inter) return -1;
      return hits.find((h) => h.mesh === inter.object)!.i;
    }

    function applyState(i: number) {
      const n = nodes[i]; const r = rn[i]; const paleta = PALETAS[temaRef.current].scene;
      r.core.material.color.set(n.state === "open" ? paleta.fail[0] : n.state === "half" ? paleta.halfOpen : paleta.core);
      (r.shell.material as THREE.ShaderMaterial).uniforms.uCol.value.set(n.state === "open" ? paleta.fail[1] : paleta.shell);
      r.halo.material.color.set(n.state === "open" ? paleta.fail[2] : paleta.halo);
    }

    function reroute(i: number) {
      const nb = nodes[i].edges.map((ei) => { const e = edges[ei]; return e.a === i ? e.b : e.a; }).filter((n) => nodes[n].born && nodes[n].state !== "open");
      if (nb.length < 2) return;
      for (let tries = 0; tries < 6; tries++) {
        const s = nb[Math.floor(Math.random() * nb.length)]; let t = s; while (t === s) t = nb[Math.floor(Math.random() * nb.length)];
        const prev = new Map<number, [number, number] | null>([[s, null]]); const q = [s]; let found = false;
        while (q.length && !found) {
          const n = q.shift()!;
          for (const ei of nodes[n].edges) {
            const e = edges[ei]; const o = e.a === n ? e.b : e.a;
            if (o === i || prev.has(o) || !nodes[o].born || nodes[o].state === "open") continue;
            prev.set(o, [n, ei]); if (o === t) { found = true; break; } q.push(o);
          }
        }
        if (!found) continue;
        let cur = t; while (cur !== s) { const [pn, ei] = prev.get(cur)!; edges[ei].hl = 1; cur = pn; }
        for (let k = 0; k < 4; k++) { const p = pulses[Math.floor(Math.random() * pulses.length)]; setTimeout(() => spawnPulse(p, s, true), k * 350); }
        return;
      }
    }

    function failNode(i: number) {
      const n = nodes[i]; if (!n || n.state !== "ok" || !n.born) return;
      n.state = "open"; n.t0 = performance.now(); applyState(i); reroute(i);
    }

    // A cena fica atrás do conteúdo (-z-10), então os eventos chegam no overlay,
    // nunca no canvas. Escutamos na janela e ignoramos o que for conteúdo real.
    const BLOQUEIA = 'a,button,input,textarea,select,[role="button"]';
    const sobreConteudo = (t: EventTarget | null) => t instanceof Element && !!t.closest(BLOQUEIA);

    function handlePointerMove(e: PointerEvent) {
      const i = sobreConteudo(e.target) ? -1 : pickRepo(e.clientX, e.clientY);
      if ((i >= 0) !== (hoverRepo >= 0)) {
        window.dispatchEvent(new CustomEvent("raizes:hover-node", { detail: { hovering: i >= 0 } }));
      }
      hoverRepo = i;
      document.body.style.cursor = i >= 0 ? "pointer" : "";
      if (i >= 0 && nodes[i].repoIndex >= 0) {
        const no = nos[nodes[i].repoIndex];
        const conecta = ligacoes.filter((l) => l.a === no.id || l.b === no.id).map((l) => (l.a === no.id ? l.b : l.a));
        setTooltip({ nome: no.nome, tags: no.tags, commits: Math.round(no.commits), conecta });
        setTooltipPos({ x: e.clientX, y: e.clientY });
      } else setTooltip(null);
    }
    function handleClick(e: MouseEvent) {
      if (sobreConteudo(e.target)) return;
      const i = pickRepo(e.clientX, e.clientY);
      if (i >= 0) failNode(i);
    }
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("click", handleClick);

    function applyPalette(paleta: PaletaScene) {
      lineMat.uniforms.uCol.value.set(corThree(paleta.filament));
      edges.forEach((e) => { if (e.tube) (e.tube.material as THREE.MeshBasicMaterial).color.set(corThree(paleta.filament)); });
      rn.forEach((r, i) => { r.rings.forEach((rg) => (rg.material as THREE.MeshBasicMaterial).color.set(corThree(paleta.ring))); applyState(i); });
      mistSprites.forEach((s, i) => s.material.color.set(corThree(paleta.mist[i % paleta.mist.length])));
    }
    applyPaletteRef.current = applyPalette;
    applyPalette(PALETAS[temaRef.current].scene);

    let last = performance.now();
    let frameId: number;
    let primeiroFrame = true;
    function tick(now: number) {
      frameId = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const paleta = PALETAS[temaRef.current].scene;

      if (!aberturaPausada) tempoAberturaRef.current += dt;
      const uT = reduce ? 400 : Math.min(400, (tempoAberturaRef.current / 8) * 400);
      lineMat.uniforms.uT.value = uT; lineMat.uniforms.uTime.value = now / 1000;

      rn.forEach((r, i) => {
        const n = nodes[i]; const no = nos[i];
        n.born = uT >= n.birth;
        const visivel = n.born;
        r.core.visible = r.shell.visible = r.halo.visible = visivel;
        r.rings.forEach((rg) => (rg.visible = visivel));
        if (!visivel) return;
        const pulse = 1 + 0.07 * Math.sin(now / 600 + i * 2) + (hoverRepo === i ? 0.3 : 0);
        r.core.scale.setScalar(pulse);
        (r.shell.material as THREE.ShaderMaterial).uniforms.uI.value = n.state === "open" ? 0.25 : 0.55 + (hoverRepo === i ? 0.5 : 0);
        const hs = (n.state === "open" ? 0.5 : n.state === "half" ? 0.75 + Math.sin(now / 120) * 0.12 : 1) * (no.destaque ? 6 : 2.6) * pulse;
        r.halo.scale.set(hs, hs, 1);
        r.rings.forEach((rg, q) => { rg.rotation.z += dt * (0.4 + i * 0.05 + q * 0.1); rg.rotation.y += dt * 0.2; });
        if (n.state === "open" && now - n.t0 > 4500) { n.state = "half"; n.t0 = now; applyState(i); }
        else if (n.state === "half" && now - n.t0 > 2600) { n.state = "ok"; n.t0 = now; applyState(i); }
      });

      let dd = false;
      for (const e of edges) {
        if (e.hl > 0) e.hl = Math.max(0, e.hl - dt / 3);
        const hvT = hoverRepo >= 0 && (e.a === hoverRepo || e.b === hoverRepo) ? 1 : 0;
        e.hv += (hvT - e.hv) * Math.min(1, dt * 8);
        const stBr = (s: string) => (s === "open" ? 0.05 : s === "half" ? 0.5 : 1);
        const st = Math.min(stBr(nodes[e.a].state), stBr(nodes[e.b].state));
        const tgt = st * (1 + e.hv * 1.2) + e.hl * 2.4;
        if (Math.abs(tgt - e.dyn) > 0.004) {
          e.dyn = tgt;
          for (let k = 0; k < e.n; k++) DYN[e.o + k] = tgt;
          dd = true;
        }
        if (e.tube) (e.tube.material as THREE.MeshBasicMaterial).opacity = Math.min(0.95, 0.5 * st * (1 + e.hv * 0.8 + e.hl * 1.5));
      }
      if (dd) (lg.attributes.aDyn as THREE.BufferAttribute).needsUpdate = true;

      let pi = 0;
      pulses.forEach((p) => {
        if (p.e >= 0) {
          const e = edges[p.e]; p.t += p.v * dt;
          if (p.t >= 1) {
            const node = p.dir > 0 ? e.B : e.A;
            if (!okN(node)) spawnPulse(p);
            else {
              const cand = nodes[node].edges.filter((ei) => { if (ei === p.e && nodes[node].edges.length > 1) return false; const ee = edges[ei]; const o = ee.a === node ? ee.b : ee.a; return okN(o); });
              if (!cand.length) spawnPulse(p);
              else { const ei = cand[Math.floor(Math.random() * cand.length)]; const ne = edges[ei]; p.e = ei; p.dir = ne.A === node ? 1 : -1; p.t = 0; p.v = (p.big ? 5 : 2.4 + Math.random() * 3.4) / ne.len; }
            }
          }
        }
        for (let k = 0; k <= TR; k++) {
          if (p.e < 0) { dynP.set(pi++, 0, -999, 0, 0, 0, 0, 0, 0); continue; }
          const tt = Math.max(0, Math.min(1, p.t) - k * 0.032);
          const u = edges[p.e].curve.getPoint(p.dir > 0 ? tt : 1 - tt);
          const f = 1 - k / (TR + 1);
          const head = corThree(paleta.pulseHead), trail = corThree(paleta.pulseTrail);
          const c = k === 0 ? head : trail;
          dynP.set(pi++, u.x, u.y, u.z, (k === 0 ? (p.big ? 0.62 : 0.42) : 0.3 * f) * (p.big ? 1.3 : 1), c.r, c.g, c.b, k === 0 ? 0.98 : 0.8 * Math.pow(f, 1.5));
        }
      });
      dynP.flush();

      const secCol = corThree(paleta.secondary);
      secundarios.forEach((n, i) => { const a = n.born ? 0.7 + 0.3 * Math.sin(now / 1000 + i * 1.7) : 0; secP.set(i, n.p.x, n.p.y, n.p.z, 0.4, secCol.r, secCol.g, secCol.b, a); });
      secP.flush();

      amb.forEach((a, i) => {
        if (!reduce) { a.y += dt * a.v * (a.bk ? 0.4 : 1); if (a.y > 13) a.y = -13; a.x += Math.sin(now / 1000 * 0.3 + i) * dt * 0.1; }
        const c = a.bk ? corThree(paleta.bokeh) : corThree(paleta.spore);
        ambP.set(i, a.x, a.y, a.z, a.s, c.r, c.g, c.b, a.a);
      });
      ambP.flush();

      const alvo = camAlvo.current;
      if (alvo) {
        camPos.x += (alvo.position.x - camPos.x) * 0.05; camPos.y += (alvo.position.y - camPos.y) * 0.05; camPos.z += (alvo.position.z - camPos.z) * 0.05;
        camLook.x += (alvo.target.x - camLook.x) * 0.05; camLook.y += (alvo.target.y - camLook.y) * 0.05; camLook.z += (alvo.target.z - camLook.z) * 0.05;
        camera.position.copy(camPos); camera.lookAt(camLook);
      }
      renderer.render(scene, camera);
      if (primeiroFrame) {
        primeiroFrame = false;
        // O carregamento dinâmico (ssr:false) e a inicialização do WebGL deixam
        // um instante sem nenhum frame desenhado; escondemos o canvas até aqui
        // e só então revelamos, para nunca mostrar tela vazia.
        canvas!.style.opacity = "1";
      }
    }
    frameId = requestAnimationFrame(tick);

    function resize() {
      const w = canvas!.clientWidth, h = canvas!.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
      uScale.value = (h * renderer.getPixelRatio()) / (2 * Math.tan((camera.fov * Math.PI) / 360));
    }
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("click", handleClick);
      if (debugAtivo) window.removeEventListener("keydown", handleDebugKey);
      document.body.style.cursor = "";
      if (hoverRepo >= 0) {
        window.dispatchEvent(new CustomEvent("raizes:hover-node", { detail: { hovering: false } }));
      }
      ro.disconnect();
      renderer.dispose();
    };
  }, [nos, ligacoes, camAlvo]);

  return (
    <>
      <div ref={wrapRef} className="fixed inset-0 -z-10">
        <canvas
          ref={canvasRef}
          style={{ display: "block", width: "100%", height: "100%", opacity: 0, transition: "opacity 0.3s ease" }}
        />
      </div>
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none rounded-2xl px-4 py-3 text-sm"
          style={{
            left: Math.min(tooltipPos.x + 16, (typeof window !== "undefined" ? window.innerWidth : 0) - 260),
            top: Math.min(tooltipPos.y + 16, (typeof window !== "undefined" ? window.innerHeight : 0) - 160),
            background: "var(--glass)",
            border: "1px solid var(--line)",
            color: "var(--ink)",
            backdropFilter: "blur(12px)",
            maxWidth: 240,
          }}
        >
          <b className="block mb-1">{tooltip.nome}</b>
          {tooltip.tags.length > 0 && <div className="text-xs opacity-70 mb-1">{tooltip.tags.join(" · ")}</div>}
          <div className="text-xs opacity-70">{tooltip.commits} commits</div>
          {tooltip.conecta.length > 0 && <div className="text-xs opacity-60 mt-1">conecta a: {tooltip.conecta.join(", ")}</div>}
        </div>
      )}
    </>
  );
}
