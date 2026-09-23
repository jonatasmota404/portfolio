import perfilData from "@/content/perfil.json";

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
};

export function buscarPerfil(): Perfil {
  return perfilData as Perfil;
}

// Pega um campo bilíngue no idioma certo (português é o padrão).
export function t2(campo: TextoBilingue, locale: string): string {
  return locale === "en" ? campo.en : campo.pt;
}
