import { buscarPerfilRemoto } from "@/lib/github";

export type TextoBilingue = { pt: string; en: string };

export type Perfil = {
  nome: string;
  cargo: TextoBilingue;
  bio: TextoBilingue;
  atributos: {
    stack: TextoBilingue;
    foco: TextoBilingue;
    formacaoCurso: TextoBilingue;
    formacaoInstituicao: string;
    base: TextoBilingue;
  };
  disponibilidade: {
    titulo: TextoBilingue;
    local: TextoBilingue;
  };
  contato: {
    email: string;
    github: string;
    linkedin: string;
    site: string;
  };
  atualizadoEm?: string;
};

// Fonte primária: perfil.json no repositório jonatasmota404. O JSON local só entra
// se a busca remota falhar, pra Sobre e Home nunca quebrarem por causa do GitHub.
export async function buscarPerfil(): Promise<Perfil> {
  const remoto = await buscarPerfilRemoto();
  if (remoto) return remoto;
  const fallback = await import("@/content/perfil-fallback.json");
  return fallback.default as Perfil;
}

// Pega um campo bilíngue no idioma certo (português é o padrão).
export function t2(campo: TextoBilingue, locale: string): string {
  return locale === "en" ? campo.en : campo.pt;
}
