export type SecaoReadme = { titulo: string; corpo: string };
export type ReadmeExtraido = { introducao: string; secoes: SecaoReadme[] };

export function extrairSecoesReadme(markdown: string): ReadmeExtraido {
  const semTituloH1 = markdown.replace(/^#\s+.*$/m, "").trim();
  const partes = semTituloH1.split(/^##\s+/m);

  const introducao = partes[0].trim();
  const secoes = partes.slice(1).map((bloco) => {
    const [primeiraLinha, ...resto] = bloco.split("\n");
    return { titulo: primeiraLinha.trim(), corpo: resto.join("\n").trim() };
  });

  return { introducao, secoes };
}

export function extrairBullets(markdownLista: string): string[] {
  return markdownLista
    .split("\n")
    .filter((linha) => linha.trim().startsWith("-"))
    .map((linha) => linha.trim().replace(/^-\s*\S+\s*/, "").trim());
}

export function extrairCargo(introducao: string): { cargo: string; corpo: string } {
  const match = introducao.match(/^>\s*(.+)\n+([\s\S]*)$/);
  if (match) {
    return { cargo: match[1].trim(), corpo: match[2].trim() };
  }
  return { cargo: "", corpo: introducao };
}