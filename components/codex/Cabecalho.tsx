"use client";

import { useState, useEffect, useTransition } from "react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Mail, Menu, X, Search, Globe } from "lucide-react";
import { SeletorTema } from "@/components/tema/SeletorTema";
import { ModalBusca } from "./ModalBusca";

function IconeGitHub() { return <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>; }
function IconeLinkedIn() { return <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>; }
function LinksDeContato() { return (<> <a href="https://github.com/jonatasmota404" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="opacity-80 hover:opacity-100 transition-opacity"><IconeGitHub /></a> <a href="https://www.linkedin.com/in/jonatas-jr/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="opacity-80 hover:opacity-100 transition-opacity"><IconeLinkedIn /></a> <a href="mailto:jonatasjr.019@gmail.com" aria-label="Email" className="opacity-80 hover:opacity-100 transition-opacity"><Mail size={16} /></a> </>); }

export function Cabecalho() {
  const t = useTranslations("nav");
  const [aberto, setAberto] = useState(false);
  const [buscaAberta, setBuscaAberta] = useState(false);

  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setBuscaAberta(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const alternarIdioma = () => {
    const proximoIdioma = locale === 'pt' ? 'en' : 'pt';
    
    // Remove o prefixo do idioma atual do pathname (ex: /en/sobre vira /sobre)
    const pathSemLocale = pathname.replace(/^\/(en|pt)/, '');
    
    // Força o recarregamento com a nova rota, disparando a animação mágica do caderno
    window.location.href = `/${proximoIdioma}${pathSemLocale || '/'}`;
  };

  return (
    <>
      <header className="w-full py-6 relative z-20">
        <div className="flex items-center justify-between">
          <Link href="/" className="group flex items-baseline gap-3 focus:outline-none">
            <span className="font-voice italic text-2xl font-bold tracking-wide opacity-80 group-hover:opacity-100 transition-opacity">
              Jônatas Mota
            </span>
            <span className="text-[9px] font-mono uppercase tracking-widest opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0 transition-all duration-300">
              Computer Science
            </span>
          </Link>

          {/* Desktop */}
          <div className="hidden sm:flex items-center gap-7">
            <button onClick={() => setBuscaAberta(true)} className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-current/15 bg-current/[0.02] hover:bg-current/[0.05] hover:border-current/30 transition-all text-xs font-mono opacity-70 hover:opacity-100 group focus:outline-none">
              <Search size={14} className="opacity-70 group-hover:opacity-100 transition-opacity" />
              <span className="uppercase tracking-widest">Índice</span>
              <kbd className="ml-2 px-1.5 py-0.5 rounded-md bg-current/5 border border-current/10 opacity-60 font-sans text-[10px]">⌘K</kbd>
            </button>

            <div className="h-4 w-px bg-current/20" />

            <nav className="flex gap-6 text-sm">
              <Link href="/projetos" className="opacity-80 hover:opacity-100 transition-opacity">{t("projetos")}</Link>
              <Link href="/escritos" className="opacity-80 hover:opacity-100 transition-opacity">{t("escritos")}</Link>
              <Link href="/sobre" className="opacity-80 hover:opacity-100 transition-opacity">{t("sobre")}</Link>
            </nav>

            <div className="h-4 w-px bg-current/20" />

            {/* Controles: Redes, Idioma e Tema */}
            <div className="flex items-center gap-4">
              <LinksDeContato />
              <div className="w-1 h-1 rounded-full bg-current/20 mx-1" />

              {/* Botão de Idioma */}
              <button
                onClick={alternarIdioma}
                disabled={isPending}
                className="flex items-center gap-1.5 opacity-70 hover:opacity-100 hover:text-[#C1571F] transition-all focus:outline-none disabled:opacity-30"
                aria-label="Alternar Idioma"
              >
                <Globe size={15} className={isPending ? "animate-spin" : ""} />
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest">
                  {locale}
                </span>
              </button>

              <SeletorTema />
            </div>
          </div>

          {/* Mobile */}
          <div className="sm:hidden flex items-center gap-4">
            <button onClick={() => setBuscaAberta(true)} className="p-1 opacity-70 hover:opacity-100 focus:outline-none">
              <Search size={18} />
            </button>
            <button 
              onClick={alternarIdioma} 
              disabled={isPending}
              className="p-1 opacity-70 hover:opacity-100 focus:outline-none uppercase font-mono text-[10px] font-bold disabled:opacity-30 flex items-center gap-1"
            >
              <Globe size={13} className={isPending ? "animate-spin" : ""} />
              {locale}
            </button>
            <button className="p-1 opacity-70 hover:opacity-100 focus:outline-none" onClick={() => setAberto(!aberto)}>
              {aberto ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Menu Mobile Corrigido (Fundo Sólido e Sombra Forte) */}
        {aberto && (
          <div
            className="sm:hidden mt-4 flex flex-col gap-4 border rounded-3xl p-6 shadow-2xl absolute w-full left-0 z-[100]"
            style={{ backgroundColor: "var(--pagina-bg)", borderColor: "var(--pagina-texto)", opacity: 0.98 }}
          >
            <nav className="flex flex-col gap-4 text-sm font-voice italic text-lg">
              <Link href="/projetos" onClick={() => setAberto(false)}>{t("projetos")}</Link>
              <Link href="/escritos" onClick={() => setAberto(false)}>{t("escritos")}</Link>
              <Link href="/sobre" onClick={() => setAberto(false)}>{t("sobre")}</Link>
            </nav>
            <hr className="border-current/10 my-2" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <LinksDeContato />
              </div>
              <SeletorTema />
            </div>
          </div>
        )}
      </header>

      <ModalBusca aberto={buscaAberta} onFechar={() => setBuscaAberta(false)} />
    </>
  );
}