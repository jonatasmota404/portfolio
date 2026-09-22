// Compensa o cabeçalho fixo (sticky) ao calcular o destino da rolagem.
const FOLGA_EXTRA_PX = 12;

function alturaCabecalho(): number {
  const header = document.querySelector<HTMLElement>(".site-header-wrap");
  return header ? header.getBoundingClientRect().height : 0;
}

function preferemMenosMovimento(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Rola suavemente até o elemento com o `id` informado. Retorna false se o elemento ainda não existe no DOM. */
export function rolarSuaveAte(id: string): boolean {
  const alvo = document.getElementById(id);
  if (!alvo) return false;

  const topoAlvo = alvo.getBoundingClientRect().top + window.scrollY;
  const destino = Math.max(0, topoAlvo - alturaCabecalho() - FOLGA_EXTRA_PX);

  window.scrollTo({ top: destino, behavior: preferemMenosMovimento() ? "auto" : "smooth" });
  return true;
}

function topoAbsoluto(id: string): number | null {
  const alvo = document.getElementById(id);
  return alvo ? alvo.getBoundingClientRect().top + window.scrollY : null;
}

/**
 * Como `rolarSuaveAte`, mas tenta novamente por um tempo caso o elemento ainda
 * não tenha sido montado (ex.: seção que depende da cena 3D carregar) — e, mesmo
 * depois de encontrá-lo, reconfere se a posição ainda muda (fontes, imagens e o
 * canvas 3D podem deslocar o layout depois do primeiro scroll) até estabilizar.
 */
export function rolarSuaveAteComEspera(id: string, tentativasRestantes = 40, intervaloMs = 120): void {
  const topoAntes = topoAbsoluto(id);

  if (topoAntes == null) {
    if (tentativasRestantes <= 0) return;
    window.setTimeout(() => rolarSuaveAteComEspera(id, tentativasRestantes - 1, intervaloMs), intervaloMs);
    return;
  }

  rolarSuaveAte(id);
  if (tentativasRestantes <= 0) return;

  window.setTimeout(() => {
    const topoDepois = topoAbsoluto(id);
    if (topoDepois != null && Math.abs(topoDepois - topoAntes) > 4) {
      rolarSuaveAteComEspera(id, tentativasRestantes - 1, intervaloMs);
    }
  }, intervaloMs);
}
