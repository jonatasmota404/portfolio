"use server";

import { listarRepositorios, listarEscritos } from "@/lib/github";

function formatarNome(texto: string) {
  if (!texto) return "";
  return texto.split(/[-_]/).map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(" ");
}

export type ItemBusca = {
  id: string;
  tipo: "projeto" | "escrito";
  titulo: string;
  descricao: string;
  categoria: string;
  link: string;
};

export async function obterIndiceBusca(locale: string): Promise<ItemBusca[]> {
  const [repos, posts] = await Promise.all([
    listarRepositorios(),
    listarEscritos(locale)
  ]);

  const indice: ItemBusca[] = [];

  // Mapear Projetos
  for (const repo of repos) {
    const limpos = (repo.topics || []).filter((t: string) => t.toLowerCase() !== "portfolio");
    const categoria = limpos.length > 0 ? limpos[0] : "geral";

    indice.push({
      id: repo.name,
      tipo: "projeto",
      titulo: formatarNome(repo.name),
      descricao: repo.description || "",
      categoria: formatarNome(categoria),
      link: `/projetos/${repo.name}`
    });
  }

  // Mapear Escritos
  for (const post of posts) {
    const { title, description, tags } = post.data;
    const categoria = tags && tags.length > 0 ? tags[0] : "geral";

    indice.push({
      id: post.slug,
      tipo: "escrito",
      titulo: title || formatarNome(post.slug),
      descricao: description || "",
      categoria: formatarNome(categoria),
      link: `/escritos/${post.slug}`
    });
  }

  return indice;
}