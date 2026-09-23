"use client";

import { useState, useMemo } from "react";
import { Link } from "@/i18n/navigation";
import { MiniaturaRepo } from "@/components/projetos/MiniaturaRepo";
import { FiltroPills } from "@/components/ui/FiltroPills";
import { gerarHue } from "@/lib/raizes";

type Post = {
  slug: string;
  data: {
    title?: string;
    description?: string;
    date?: string;
    tags?: string[];
    tecnologias?: string[];
    [key: string]: any;
  };
};

function formatarNome(texto: string) {
  if (!texto) return "";
  return texto
    .split(/[-_]/)
    .map((palavra) => palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase())
    .join(" ");
}

export function ListaEscritos({ posts }: { posts: Post[] }) {
  const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>(null);
  const [techAtiva, setTechAtiva] = useState<string | null>(null);

  // 1. Estruturar os dados
  const postsEstruturados = useMemo(() => {
    return posts.map((post) => {
      // Usa a primeira tag como Categoria (ou 'geral')
      const categoria = post.data.tags && post.data.tags.length > 0 ? post.data.tags[0].toLowerCase() : "geral";
      const tecnologias = post.data.tecnologias || [];
      return { ...post, categoria, tecnologias };
    });
  }, [posts]);

  // 2. Extrair listas únicas
  const categorias = useMemo(() => {
    return Array.from(new Set(postsEstruturados.map((p) => p.categoria))).sort();
  }, [postsEstruturados]);

  // "geral" é só um valor interno de agrupamento — só vira botão de filtro
  // quando é a única categoria existente (senão duplicaria o "Todos").
  const categoriasExibidas = useMemo(() => {
    return categorias.length > 1 ? categorias.filter((cat) => cat !== "geral") : categorias;
  }, [categorias]);

  function formatarCategoria(cat: string) {
    if (cat === "geral" && categorias.length === 1) return "Sem categoria";
    return formatarNome(cat);
  }

  const techsVisiveis = useMemo(() => {
    const validos = categoriaAtiva 
      ? postsEstruturados.filter((p) => p.categoria === categoriaAtiva) 
      : postsEstruturados;
    
    const t = new Set<string>();
    validos.forEach((p) => p.tecnologias.forEach((tech: string) => t.add(tech)));
    return Array.from(t).sort();
  }, [postsEstruturados, categoriaAtiva]);

  // 3. Filtrar
  const postsFiltrados = useMemo(() => {
    return postsEstruturados.filter((p) => {
      const matchCat = categoriaAtiva ? p.categoria === categoriaAtiva : true;
      const matchTech = techAtiva ? p.tecnologias.includes(techAtiva) : true;
      return matchCat && matchTech;
    });
  }, [postsEstruturados, categoriaAtiva, techAtiva]);

  function selecionarCategoria(cat: string | null) {
    setCategoriaAtiva(cat);
    setTechAtiva(null);
  }

  return (
    <div className="flex flex-col gap-10">
      
      {/* PAINEL DE FILTROS (DOIS NÍVEIS) */}
      <div className="flex flex-col gap-5 mb-4">
        <FiltroPills
          rotulo="domínio"
          opcoes={categoriasExibidas}
          ativa={categoriaAtiva}
          aoSelecionar={selecionarCategoria}
          formatarRotulo={formatarCategoria}
          variante="grande"
        />

        {techsVisiveis.length > 0 && (
          <FiltroPills
            rotulo="tecnologias"
            opcoes={techsVisiveis}
            ativa={techAtiva}
            aoSelecionar={setTechAtiva}
            variante="pequena"
          />
        )}
      </div>

      {/* GRID DE ESCRITOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
        {postsFiltrados.map((post) => {
          const { title, description, date } = post.data;
          const dataFormatada = date ? new Date(date).toLocaleDateString("pt-BR", { year: 'numeric', month: 'short', day: 'numeric' }) : "";
          const tituloExibicao = title || formatarNome(post.slug);

          return (
            <div key={post.slug} className="painel rounded-3xl p-6 shadow-sm flex flex-col h-full group transition-all duration-300 hover:shadow-md hover:-translate-y-1">
              <Link href={`/escritos/${post.slug}`} className="block shrink-0 focus:outline-none mb-6">
                <MiniaturaRepo hue={gerarHue(post.slug)} variante="escrito" />
              </Link>

              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex flex-col items-start gap-1 mb-1">
                  <span className="text-[10px] font-mono opacity-50 uppercase tracking-widest mb-1" style={{ color: "var(--accent)" }}>
                    {formatarNome(post.categoria)}
                  </span>
                  <Link href={`/escritos/${post.slug}`} className="heading-3 text-lg hover:opacity-70 transition-opacity">
                    {tituloExibicao}
                  </Link>
                  {dataFormatada && <span className="text-xs font-mono opacity-50">{dataFormatada}</span>}
                </div>

                <p className="apoio text-[0.95rem] mt-2 mb-8 flex-1">
                  {description}
                </p>

                {post.tecnologias.length > 0 ? (
                  <div className="flex gap-2 flex-wrap mt-auto">
                    {post.tecnologias.map((tag: string) => (
                      <span key={tag} className="text-[10px] font-mono border rounded-full px-2.5 py-1 uppercase tracking-wider" style={{ color: "var(--accent)", borderColor: "color-mix(in srgb, var(--accent) 30%, transparent)", backgroundColor: "color-mix(in srgb, var(--accent) 6%, transparent)" }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="mt-auto pt-2 flex justify-end border-t border-dashed border-current/10">
                    <Link href={`/escritos/${post.slug}`} className="text-[10px] mt-3 font-mono uppercase tracking-widest opacity-50 group-hover:opacity-100 transition-opacity" style={{ color: "var(--accent)" }}>
                      Ler registo →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {postsFiltrados.length === 0 && (
        <div className="rotulo text-center py-12">Nenhum registo encontrado com esta combinação</div>
      )}
    </div>
  );
}