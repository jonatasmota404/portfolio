"use client";

import { useState, useEffect, useRef } from "react";
import { Link } from "@/i18n/navigation";
import { Search, X, BookOpen, CodeXml } from "lucide-react";
import { useLocale } from "next-intl";
import { obterIndiceBusca, type ItemBusca } from "@/lib/busca";

type Props = {
  aberto: boolean;
  onFechar: () => void;
};

export function ModalBusca({ aberto, onFechar }: Props) {
  const [indice, setIndice] = useState<ItemBusca[]>([]);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const locale = useLocale();

  // Carrega o índice silenciosamente quando o modal abre
  useEffect(() => {
    if (aberto && indice.length === 0) {
      obterIndiceBusca(locale).then(setIndice);
    }
    if (aberto) {
      // Foca no input automaticamente ao abrir
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery(""); // Limpa a busca ao fechar
    }
  }, [aberto, indice.length, locale]);

  // Permite fechar com a tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFechar();
    };
    if (aberto) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [aberto, onFechar]);

  if (!aberto) return null;

  // Filtragem local super rápida
  const resultados = query.trim() === "" 
    ? [] 
    : indice.filter(item => 
        item.titulo.toLowerCase().includes(query.toLowerCase()) || 
        item.descricao.toLowerCase().includes(query.toLowerCase()) ||
        item.categoria.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      {/* Fundo escuro com desfoque */}
      <div 
        className="absolute inset-0 bg-[var(--color-ink)]/40 backdrop-blur-sm transition-opacity" 
        onClick={onFechar} 
      />

      {/* Caixa do Modal */}
      <div className="mundo-painel border rounded-3xl shadow-2xl w-full max-w-2xl relative z-10 flex flex-col overflow-hidden bg-[var(--pagina-bg)]">
        
        {/* Barra de Pesquisa */}
        <div className="flex items-center gap-4 p-5 border-b border-current/10">
          <Search size={24} className="opacity-50" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Pesquisar nos registros e artefatos..."
            className="flex-1 bg-transparent outline-none font-voice italic text-2xl placeholder:opacity-40"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={onFechar} className="p-1 opacity-50 hover:opacity-100 transition-opacity bg-current/5 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Resultados */}
        <div className="max-h-[60vh] overflow-y-auto p-3">
          {query.trim() !== "" && resultados.length === 0 ? (
            <p className="p-8 text-center opacity-50 font-voice italic text-lg">
              Nenhuma anotação encontrada para "{query}".
            </p>
          ) : query.trim() === "" ? (
            <div className="p-8 text-center opacity-40">
              <p className="font-mono text-xs uppercase tracking-widest mb-2">Índice do Grimório</p>
              <p className="font-voice italic">Digite para buscar conhecimentos arquitetados.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {resultados.map((item) => (
                <Link 
                  key={item.id} 
                  href={item.link} 
                  onClick={onFechar}
                  className="flex items-center gap-4 p-4 rounded-2xl hover:bg-current/[0.04] transition-colors group"
                >
                  {/* Ícone dependendo do tipo */}
                  <div className="w-10 h-10 shrink-0 rounded-full border border-current/10 flex items-center justify-center opacity-60 group-hover:opacity-100 group-hover:border-[#C1571F] group-hover:text-[#C1571F] transition-all">
                    {item.tipo === "projeto" ? <CodeXml size={18} /> : <BookOpen size={18} />}
                  </div>
                  
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-mono uppercase tracking-widest border border-current/20 rounded-full px-2 py-0.5 opacity-60">
                        {item.categoria}
                      </span>
                      <span className="font-voice italic text-lg truncate group-hover:text-[#C1571F] transition-colors">
                        {item.titulo}
                      </span>
                    </div>
                    <p className="text-sm opacity-60 truncate font-serif">
                      {item.descricao}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        
        {/* Rodapé do Modal */}
        <div className="bg-current/[0.02] border-t border-current/10 p-3 flex justify-between items-center text-[10px] font-mono opacity-50">
          <span className="uppercase tracking-widest">Navegação Global</span>
          <span>Pressione ESC para fechar</span>
        </div>
      </div>
    </div>
  );
}