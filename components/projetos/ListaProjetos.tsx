"use client";

import { useState, useMemo } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { MiniaturaRepo } from "./MiniaturaRepo";
import { FiltroPills } from "@/components/ui/FiltroPills";
import { gerarHue } from "@/lib/raizes";

function formatarNome(texto: string) {
  if (!texto) return "";
  return texto
    .split(/[-_]/)
    .map((palavra) => palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase())
    .join(" ");
}

export function ListaProjetos({ repos }: { repos: any[] }) {
  const t = useTranslations("projetos");
  const tf = useTranslations("filtros");
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

  // "geral" é só um valor interno de agrupamento — só vira botão de filtro
  // quando é a única categoria existente (senão duplicaria o "Todos").
  const categoriasExibidas = useMemo(() => {
    return categorias.length > 1 ? categorias.filter((cat) => cat !== "geral") : categorias;
  }, [categorias]);

  function formatarCategoria(cat: string) {
    if (cat === "geral" && categorias.length === 1) return tf("semCategoria");
    return formatarNome(cat);
  }

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
        <FiltroPills
          rotulo={tf("dominio")}
          opcoes={categoriasExibidas}
          ativa={categoriaAtiva}
          aoSelecionar={selecionarCategoria}
          formatarRotulo={formatarCategoria}
          variante="grande"
        />

        {techsVisiveis.length > 0 && (
          <FiltroPills
            rotulo={tf("tecnologias")}
            opcoes={techsVisiveis}
            ativa={techAtiva}
            aoSelecionar={setTechAtiva}
            variante="pequena"
          />
        )}
      </div>

      {/* GRID DE PROJETOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
        {reposFiltrados.map((repo: any) => {
          const ano = repo.created_at ? new Date(repo.created_at).getFullYear() : "";
          const tituloExibicao = formatarNome(repo.name);

          return (
            <div key={repo.name} className="painel rounded-3xl p-6 shadow-sm flex flex-col h-full group transition-all duration-300 hover:shadow-md hover:-translate-y-1">
              <Link href={`/projetos/${repo.name}`} className="block shrink-0 focus:outline-none mb-6">
                <MiniaturaRepo hue={gerarHue(repo.name)} variante="projeto" />
              </Link>

              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <div className="flex flex-col">
                    {/* Categoria exibida subtilmente acima do título */}
                    <span className="text-[10px] font-mono opacity-50 uppercase tracking-widest mb-1" style={{ color: "var(--accent)" }}>
                      {repo.categoria === "geral" ? tf("geral") : formatarNome(repo.categoria)}
                    </span>
                    <Link href={`/projetos/${repo.name}`} className="heading-3 text-lg hover:opacity-70 transition-opacity">
                      {tituloExibicao}
                    </Link>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs font-mono opacity-50 shrink-0 pt-1">
                    {ano}
                    <a href={repo.html_url} target="_blank" rel="noopener noreferrer" aria-label={t("verNoGithub")} className="hover:opacity-100 transition-opacity relative z-10">↗</a>
                  </span>
                </div>
                
                <p className="apoio text-[0.95rem] mt-2 mb-8 flex-1">
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
        <div className="rotulo text-center py-12">{t("nenhumResultado")}</div>
      )}
    </div>
  );
}