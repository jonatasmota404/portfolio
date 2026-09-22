import * as THREE from "three";

export type TemaId = "ouro" | "gelo" | "menta" | "mar" | "brasa";

export type PaletaUI = {
  bg: string;
  ink: string;
  muted: string;
  accent: string;
  accent2: string;
  glass: string;
  line: string;
  onAccent: string;
};

export type PaletaScene = {
  dome: [string, string, string];
  filament: string;
  ring: string;
  core: string;
  shell: string;
  halo: string;
  fail: [string, string, string];
  halfOpen: string;
  mist: [string, string, string, string];
  pulseHead: string;
  pulseTrail: string;
  secondary: string;
  spore: string;
  bokeh: string;
};

export type Paleta = {
  id: TemaId;
  nome: string;
  ui: PaletaUI;
  scene: PaletaScene;
};

export const PALETAS: Record<TemaId, Paleta> = {
  ouro: {
    id: "ouro",
    nome: "Floresta e ouro",
    ui: { bg: "#040807", ink: "#efe9d6", muted: "#9fb0a4", accent: "#ffcf66", accent2: "#e8e4d4", glass: "rgba(4,12,9,.66)", line: "rgba(232,228,212,.18)", onAccent: "#0b1a12" },
    scene: {
      dome: ["#03070a", "#07140e", "#020504"],
      filament: "#e8e4d4", ring: "#e8e4d4", core: "#fff0c8", shell: "#ffcf66", halo: "#ffcf66",
      fail: ["#7a2f2f", "#b04040", "#7a2f2f"], halfOpen: "#ffb13d",
      mist: ["#0f4a34", "#1a3f2a", "#0d3a2a", "#2a4a2a"],
      pulseHead: "#ffedb2", pulseTrail: "#ffc75c", secondary: "#d9d4bd", spore: "#ffe3a1", bokeh: "#80e6bf",
    },
  },
  gelo: {
    id: "gelo",
    nome: "Gelo e vermelhão",
    ui: { bg: "#07090c", ink: "#eef2f6", muted: "#9aa6b2", accent: "#ff4d3a", accent2: "#dfe6ec", glass: "rgba(8,11,15,.68)", line: "rgba(223,230,236,.18)", onAccent: "#10070a" },
    scene: {
      dome: ["#05070a", "#0c1218", "#030406"],
      filament: "#dfe6ec", ring: "#dfe6ec", core: "#f4f8fb", shell: "#ff5a45", halo: "#ff4d3a",
      fail: ["#5a6470", "#6a7480", "#5a6470"], halfOpen: "#ffb07a",
      mist: ["#1b2733", "#22303f", "#171f29", "#2a3644"],
      pulseHead: "#ffccb8", pulseTrail: "#ff4c3b", secondary: "#d1deeb", spore: "#ff8c73", bokeh: "#b2ccf2",
    },
  },
  menta: {
    id: "menta",
    nome: "Aurora menta",
    ui: { bg: "#050a0c", ink: "#e8f6f0", muted: "#9bb8b0", accent: "#7dffb8", accent2: "#a68bff", glass: "rgba(4,12,14,.68)", line: "rgba(191,232,216,.2)", onAccent: "#04150f" },
    scene: {
      dome: ["#03080c", "#08161a", "#020507"],
      filament: "#bfe8d8", ring: "#a68bff", core: "#eafff5", shell: "#a68bff", halo: "#7dffb8",
      fail: ["#ff6b6b", "#ff6b6b", "#ff6b6b"], halfOpen: "#ffd166",
      mist: ["#0f3a3a", "#1d2a4a", "#0d3a30", "#2a2450"],
      pulseHead: "#d9ffeb", pulseTrail: "#7dffb8", secondary: "#b2e6d9", spore: "#99ffcc", bokeh: "#a68cff",
    },
  },
  mar: {
    id: "mar",
    nome: "Mar profundo",
    ui: { bg: "#020814", ink: "#e8f0ff", muted: "#93a8c8", accent: "#ffd166", accent2: "#9fc4ff", glass: "rgba(3,10,24,.68)", line: "rgba(159,196,255,.2)", onAccent: "#0a0f1c" },
    scene: {
      dome: ["#010510", "#061a33", "#010308"],
      filament: "#9fc4ff", ring: "#9fc4ff", core: "#f2f7ff", shell: "#ffd166", halo: "#ffd166",
      fail: ["#e0574f", "#e0574f", "#e0574f"], halfOpen: "#ffb13d",
      mist: ["#0a2a5a", "#123a6a", "#0a2448", "#1a4a7a"],
      pulseHead: "#fff2bf", pulseTrail: "#ffd166", secondary: "#99bff2", spore: "#ffd980", bokeh: "#73b2ff",
    },
  },
  brasa: {
    id: "brasa",
    nome: "Cobre e brasa",
    ui: { bg: "#0a0604", ink: "#f4e6d8", muted: "#b39a86", accent: "#ffb347", accent2: "#d99a6c", glass: "rgba(14,8,5,.68)", line: "rgba(217,154,108,.22)", onAccent: "#140a05" },
    scene: {
      dome: ["#080403", "#1a0d07", "#040201"],
      filament: "#d99a6c", ring: "#d99a6c", core: "#fff0dc", shell: "#ff8a3a", halo: "#ffb347",
      fail: ["#8c2a1f", "#b03a2a", "#8c2a1f"], halfOpen: "#ffd07a",
      mist: ["#3a1a0a", "#4a230e", "#2a1408", "#5a2c10"],
      pulseHead: "#ffe6a6", pulseTrail: "#ffb247", secondary: "#d9a680", spore: "#ffb259", bokeh: "#e68c4c",
    },
  },
};

export const TEMA_PADRAO: TemaId = "ouro";

export function corThree(hex: string): THREE.Color {
  return new THREE.Color(hex);
}
