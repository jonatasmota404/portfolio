import { writeFile, mkdir, readFile, rename } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { GITHUB_USER } from "@/lib/github";

type LocaleCurriculo = "pt-br" | "en";

const DIR_CURRICULO = path.join(process.cwd(), "public", "curriculo");

function localeCurriculo(locale: string): LocaleCurriculo {
  return locale === "en" ? "en" : "pt-br";
}

function urlRemota(locale: LocaleCurriculo): string {
  return `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_USER}/main/curriculo/${locale}/jonatas-mota.pdf`;
}

async function baixarUm(locale: LocaleCurriculo): Promise<boolean> {
  try {
    const resposta = await fetch(urlRemota(locale), { cache: "no-store" });
    if (!resposta.ok) return false;
    const buffer = Buffer.from(await resposta.arrayBuffer());
    await mkdir(DIR_CURRICULO, { recursive: true });
    // Escreve num temporário e renomeia: quem baixar durante a atualização nunca recebe um PDF pela metade.
    const destino = path.join(DIR_CURRICULO, `${locale}.pdf`);
    await writeFile(`${destino}.tmp`, buffer);
    await rename(`${destino}.tmp`, destino);
    return true;
  } catch {
    return false;
  }
}

export async function atualizarCurriculos(): Promise<{ "pt-br": boolean; en: boolean }> {
  const [ptBr, en] = await Promise.all([baixarUm("pt-br"), baixarUm("en")]);
  return { "pt-br": ptBr, en };
}

// URL pública do currículo. Passa por um route handler porque, em produção, o `next start`
// só indexa `public/` na inicialização — arquivos baixados depois não seriam servidos direto.
export function caminhoCurriculo(locale: string): string {
  return `/api/curriculo/${localeCurriculo(locale)}`;
}

// Lê o PDF baixado; se ainda não existir, cai no fallback versionado no repositório do site.
export async function lerCurriculo(locale: string): Promise<Buffer> {
  const l = localeCurriculo(locale);
  const caminhoReal = path.join(DIR_CURRICULO, `${l}.pdf`);
  if (existsSync(caminhoReal)) return readFile(caminhoReal);
  return readFile(path.join(DIR_CURRICULO, `${l}-fallback.pdf`));
}
