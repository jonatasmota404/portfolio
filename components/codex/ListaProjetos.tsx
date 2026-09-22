"use client";

import { useState, useMemo } from "react";
import { Link } from "@/i18n/navigation";
import { MiniaturaRepo } from "./MiniaturaRepo";
import { gerarHue } from "@/lib/raizes";

function formatarNome(texto: string) {
  if (!texto) return "";
  return texto
    .split(/[-_]/)
    .map((palavra) => palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase())
    .join(" ");
}

export function ListaProjetos({ repos }: { repos: any[] }) {
  const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>(null);
  const [techAtiva, setTechAtiva] = useState<string | null>(null);

  // 1. Estruturar os dados: extrair Categoria e Tecnologias
  const projetosEstruturados = useMemo(() => {
    return repos.map((repo) => {
      const topics = repo.topics || [];
      // Ignora a tag raiz de visibilidade
      const limpos = topics.filter((t: string) => t.toLowerCase() !== "portfolio");
      
      // A primeira que sobra é a Categoria, as restantes são as Tecnologias
      const categoria = limpos.length > 0 ? limpos[0] : "geral";
      const tecnologias = limpos.length > 1 ? limpos.slice(1) : [];
      
      return { ...repo, categoria, tecnologias };
    });
  }, [repos]);

  // 2. Extrair listas únicas para os filtros
  const categorias = useMemo(() => {
    return Array.from(new Set(projetosEstruturados.map((r) => r.categoria))).sort();
  }, [projetosEstruturados]);

  const techsVisiveis = useMemo(() => {
    const validos = categoriaAtiva 
      ? projetosEstruturados.filter((r) => r.categoria === categoriaAtiva) 
      : projetosEstruturados;
    
    const t = new Set<string>();
    validos.forEach((r) => r.tecnologias.forEach((tech: string) => t.add(tech)));
    return Array.from(t).sort();
  }, [projetosEstruturados, categoriaAtiva]);

  // 3. Filtrar os projetos que vão para a tela
  const reposFiltrados = useMemo(() => {
    return projetosEstruturados.filter((r) => {
      const matchCat = categoriaAtiva ? r.categoria === categoriaAtiva : true;
      const matchTech = techAtiva ? r.tecnologias.includes(techAtiva) : true;
      return matchCat && matchTech;
    });
  }, [projetosEstruturados, categoriaAtiva, techAtiva]);

  // Handler para trocar de categoria (limpa a tech ativa)
  function selecionarCategoria(cat: string | null) {
    setCategoriaAtiva(cat);
    setTechAtiva(null);
  }

  return (
    <div className="flex flex-col gap-10">
      
      {/* PAINEL DE FILTROS (DOIS NÍVEIS) */}
      <div className="flex flex-col gap-5 mb-4">
        
        {/* Nível 1: Categorias Principais (Estilo Livro) */}
        <div className="flex flex-wrap gap-6 items-baseline border-b border-current/10 pb-5">
          <span className="text-[11px] font-mono opacity-50 uppercase tracking-widest mr-2">
            Domínio:
          </span>
          <button
            onClick={() => selecionarCategoria(null)}
            className={`font-voice italic text-2xl transition-all ${categoriaAtiva === null ? "opacity-100" : "opacity-40 hover:opacity-70"}`}
            style={{ color: categoriaAtiva === null ? "var(--accent)" : "inherit" }}
          >
            Todos
          </button>
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => selecionarCategoria(cat)}
              className={`font-voice italic text-2xl transition-all ${categoriaAtiva === cat ? "opacity-100" : "opacity-40 hover:opacity-70"}`}
              style={{ color: categoriaAtiva === cat ? "var(--accent)" : "inherit" }}
            >
              {formatarNome(cat)}
            </button>
          ))}
        </div>

        {/* Nível 2: Tecnologias (Estilo Terminal/Pills) */}
        {techsVisiveis.length > 0 && (
          <div className="flex flex-wrap gap-2.5 items-center">
            <span className="text-[10px] font-mono opacity-40 uppercase tracking-widest mr-2">
              Tecnologias:
            </span>
            {techsVisiveis.map((tech) => (
              <button
                key={tech}
                onClick={() => setTechAtiva(tech === techAtiva ? null : tech)}
                className={`text-[10px] font-mono border rounded-full px-3.5 py-1.5 uppercase tracking-wider transition-all ${
                  techAtiva === tech
                    ? "font-bold shadow-sm"
                    : "border-current/20 opacity-60 hover:opacity-100 hover:border-current/40"
                }`}
                style={
                  techAtiva === tech
                    ? { background: "var(--accent)", color: "var(--on-accent)", borderColor: "var(--accent)" }
                    : undefined
                }
              >
                {tech}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* GRID DE PROJETOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
        {reposFiltrados.map((repo: any) => {
          const ano = repo.created_at ? new Date(repo.created_at).getFullYear() : "";
          const tituloExibicao = formatarNome(repo.name);

          return (
            <div key={repo.name} className="mundo-painel border rounded-3xl p-6 shadow-sm flex flex-col h-full group transition-all duration-300 hover:border-current/30 hover:shadow-md hover:-translate-y-1">
              <Link href={`/projetos/${repo.name}`} className="block shrink-0 focus:outline-none mb-6">
                <MiniaturaRepo hue={gerarHue(repo.name)} variante="projeto" />
              </Link>

              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <div className="flex flex-col">
                    {/* Categoria exibida subtilmente acima do título */}
                    <span className="text-[10px] font-mono opacity-50 uppercase tracking-widest mb-1" style={{ color: "var(--accent)" }}>
                      {formatarNome(repo.categoria)}
                    </span>
                    <Link href={`/projetos/${repo.name}`} className="font-mono font-semibold text-lg hover:opacity-70 transition-opacity">
                      {tituloExibicao}
                    </Link>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs font-mono opacity-50 shrink-0 pt-1">
                    {ano}
                    <a href={repo.html_url} target="_blank" rel="noopener noreferrer" aria-label="Ver no GitHub" className="hover:opacity-100 transition-opacity relative z-10">↗</a>
                  </span>
                </div>
                
                <p className="font-serif text-[1rem] leading-relaxed opacity-75 mt-2 mb-8 flex-1">
                  {repo.description}
                </p>
                
                <div className="flex gap-2 flex-wrap mt-auto">
                  {repo.tecnologias.map((tec: string) => (
                    <span key={tec} className="text-[10px] font-mono border rounded-full px-2.5 py-1 uppercase tracking-wider" style={{ color: "var(--accent)", borderColor: "color-mix(in srgb, var(--accent) 30%, transparent)", backgroundColor: "color-mix(in srgb, var(--accent) 6%, transparent)" }}>
                      {tec}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {reposFiltrados.length === 0 && (
        <div className="text-center py-12 opacity-50 font-voice italic text-lg">
          Nenhum artefato encontrado com esta combinação.
        </div>
      )}
    </div>
  );
}