"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CodexInstrument } from "@/components/codex/CodexInstrument";
import { useZona } from "@/context/ZonaContext";

type Repo = { name: string; description: string; topics?: string[] };
const MAX_DESTAQUE = 4;

function formatarNome(texto: string) {
  if (!texto) return "";
  return texto.split(/[-_]/).map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(" ");
}

export function SecaoProjetosFiltrada({ repos }: { repos: Repo[] }) {
  const { zona } = useZona();

  // 1. Converte os "repositórios" em "habilidades dinâmicas" para alimentar o Astrolábio
  const habilidadesDinamicas = useMemo(() => {
    return repos.flatMap((repo) => {
      const limpos = (repo.topics || []).filter((t) => t.toLowerCase() !== "portfolio");
      const categoria = limpos.length > 0 ? limpos[0].toLowerCase() : "geral";
      const tecnologias = limpos.length > 1 ? limpos.slice(1) : [];
      
      // O Astrolábio só precisa saber a zona e as tecnologias para gerar as "pills" e fatias
      return tecnologias.map((tech) => ({
        zona: categoria,
        tecnologia: tech,
        xp: 5 
      }));
    });
  }, [repos]);

  // 2. Filtra os projetos exibidos usando a Regra de Ouro (topics[0] === zona)
  const filtrados = repos.filter((r) => {
    const limpos = (r.topics || []).filter((t) => t.toLowerCase() !== "portfolio");
    const categoria = limpos.length > 0 ? limpos[0].toLowerCase() : "geral";
    return categoria === zona;
  });
  
  const mostrar = (filtrados.length > 0 ? filtrados : repos).slice(0, MAX_DESTAQUE);

  return (
    <>
      {/* O Astrolábio agora é alimentado pelos dados reais do GitHub! */}
      <CodexInstrument habilidades={habilidadesDinamicas} />
      
      <div className="grid gap-5 sm:grid-cols-2 mt-10 text-left">
        {mostrar.map((repo) => (
          <Link 
            key={repo.name} 
            href={`/projetos/${repo.name}`} 
            className="block border border-current/20 rounded-3xl p-6 hover:border-current/50 hover:bg-current/[0.02] hover:-translate-y-1 transition-all duration-300 shadow-sm"
          >
            <h3 className="font-voice italic text-xl mb-2">{formatarNome(repo.name)}</h3>
            <p className="font-serif text-sm opacity-75 leading-relaxed">{repo.description}</p>
          </Link>
        ))}
      </div>
    </>
  );
}