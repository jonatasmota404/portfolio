import { ImageResponse } from "next/og";

// Imagem de compartilhamento (Open Graph) comum ao site e aos artigos.
// ImageResponse só entende um subconjunto de HTML+CSS (flexbox, sem JS), então a
// "rede" da cena 3D vira círculos e linhas desenhados com divs posicionadas.

export const TAMANHO_OG = { width: 1200, height: 630 };

// Cores do tema "mar" (lib/paletas.ts) — copiadas aqui porque paletas.ts importa o three,
// que não precisa entrar no bundle da rota de imagem.
const COR = {
  bg: "#020814",
  ink: "#e8f0ff",
  muted: "#93a8c8",
  accent: "#ffd166",
  accent2: "#9fc4ff",
  line: "rgba(159,196,255,.28)",
};

// Inter Tight (a --font-tight do site) em .ttf, servida pelo Fontsource via jsDelivr:
// https://cdn.jsdelivr.net/fontsource/fonts/inter-tight@latest/ — o ImageResponse não lê woff2.
async function carregarFonte(peso: 500 | 800) {
  const url = `https://cdn.jsdelivr.net/fontsource/fonts/inter-tight@latest/latin-${peso}-normal.ttf`;
  const resposta = await fetch(url, { cache: "force-cache" });
  if (!resposta.ok) throw new Error(`Falha ao carregar Inter Tight ${peso}: ${resposta.status}`);
  return resposta.arrayBuffer();
}

// Nós da rede no canto direito (coordenadas em px dentro do canvas 1200×630) e as arestas entre eles.
const NOS: [number, number, number][] = [
  [930, 120, 14], [1080, 210, 9], [860, 300, 10], [1010, 380, 18],
  [1130, 470, 8], [900, 500, 7], [1060, 90, 6], [780, 170, 6],
];
const ARESTAS: [number, number][] = [
  [0, 1], [0, 2], [0, 6], [0, 7], [1, 3], [2, 3], [3, 4], [3, 5], [2, 5], [1, 6], [2, 7],
];

function Rede() {
  return (
    <>
      {/* arestas em SVG: o ImageResponse ignora transformOrigin, então linhas feitas com
          divs rotacionadas giravam em torno do centro e saíam do lugar */}
      <svg width={TAMANHO_OG.width} height={TAMANHO_OG.height} style={{ position: "absolute", left: 0, top: 0 }}>
        {ARESTAS.map(([a, b]) => (
          <line
            key={`${a}-${b}`}
            x1={NOS[a][0]}
            y1={NOS[a][1]}
            x2={NOS[b][0]}
            y2={NOS[b][1]}
            stroke={COR.line}
            strokeWidth={2}
          />
        ))}
      </svg>
      {NOS.map(([x, y, r], i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: x - r,
            top: y - r,
            width: r * 2,
            height: r * 2,
            borderRadius: 9999,
            // o maior nó ganha o dourado de destaque; os demais ficam no azul secundário
            background: r >= 14 ? COR.accent : COR.bg,
            border: `2px solid ${r >= 14 ? COR.accent : COR.accent2}`,
            // o ImageResponse rejeita boxShadow: undefined, então a chave só entra quando há brilho
            ...(r >= 14 ? { boxShadow: `0 0 40px ${COR.accent}` } : {}),
          }}
        />
      ))}
    </>
  );
}

export async function gerarImagemOg({
  titulo,
  subtitulo,
  rotulo,
}: {
  titulo: string;
  subtitulo: string;
  rotulo?: string;
}) {
  const [fonteForte, fonteMedia] = await Promise.all([carregarFonte(800), carregarFonte(500)]);
  // títulos de artigo podem ser longos: reduz a fonte pra caberem em até ~3 linhas
  const tamanhoTitulo = titulo.length > 40 ? 58 : titulo.length > 24 ? 72 : 96;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: `radial-gradient(circle at 85% 30%, #061a33 0%, ${COR.bg} 60%)`,
          fontFamily: "Inter Tight",
          color: COR.ink,
        }}
      >
        <Rede />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 80px",
            width: 820,
            height: "100%",
          }}
        >
          {rotulo && (
            <div style={{ fontSize: 26, fontWeight: 500, color: COR.accent, letterSpacing: 4, marginBottom: 24 }}>
              {rotulo.toUpperCase()}
            </div>
          )}
          <div style={{ fontSize: tamanhoTitulo, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>{titulo}</div>
          <div style={{ width: 96, height: 4, background: COR.accent, margin: "36px 0 28px" }} />
          <div style={{ fontSize: 32, fontWeight: 500, color: COR.muted }}>{subtitulo}</div>
        </div>
        <div style={{ position: "absolute", right: 64, bottom: 48, fontSize: 24, fontWeight: 500, color: COR.accent2 }}>
          jonatas.pro
        </div>
      </div>
    ),
    {
      ...TAMANHO_OG,
      fonts: [
        { name: "Inter Tight", data: fonteForte, weight: 800, style: "normal" },
        { name: "Inter Tight", data: fonteMedia, weight: 500, style: "normal" },
      ],
    }
  );
}
