"use client";

import { useState, useEffect } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Menu, X, Search, Globe } from "lucide-react";
import { SeletorTema } from "@/components/tema/SeletorTema";
import { rolarSuaveAte } from "@/lib/scroll";
import { ModalBusca } from "./ModalBusca";

function IconeGitHub() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function LinkGitHub() {
  return (
    <a
      href="https://github.com/jonatasmota404"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="GitHub"
      className="site-icone foco-anel"
    >
      <IconeGitHub />
    </a>
  );
}

export function Cabecalho() {
  const t = useTranslations("nav");
  const [aberto, setAberto] = useState(false);
  const [buscaAberta, setBuscaAberta] = useState(false);

  const locale = useLocale();
  const pathname = usePathname();

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
    const proximoIdioma = locale === "pt" ? "en" : "pt";
    // `usePathname` do next-intl já devolve o caminho sem prefixo; o replace é só uma rede de segurança.
    const semLocale = pathname.replace(/^\/(en|pt)(?=\/|$)/, "");
    window.location.href = `/${proximoIdioma}${semLocale === "/" ? "" : semLocale}`;
  };

  // Na Home, rola até a seção; em qualquer outra página, deixa o Link navegar para "/#contato"
  // (o hash é pego pela Home ao montar, com retry até a seção existir no DOM).
  const aoClicarContato = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setAberto(false);
    if (pathname === "/") {
      e.preventDefault();
      rolarSuaveAte("contato");
    }
  };

  return (
    <>
      <div className="site-header-wrap">
        <header className="site-header w-full py-3.5">
          <div className="max-w-[1280px] mx-auto px-6 md:px-10 flex items-center justify-between gap-6">
            <Link href="/" className="site-marca foco-anel rounded-md">
              Jônatas Mota
            </Link>

            {/* Desktop */}
            <div className="hidden sm:flex items-center gap-4">
              <button
                onClick={() => setBuscaAberta(true)}
                className="site-busca foco-anel"
                aria-label="Abrir busca"
              >
                <Search size={15} />
                <kbd className="hidden lg:inline">⌘K</kbd>
              </button>

              <nav className="flex items-center gap-1">
                <Link href="/projetos" className="site-link foco-anel">
                  {t("projetos")}
                </Link>
                <Link href="/escritos" className="site-link foco-anel">
                  {t("escritos")}
                </Link>
                <Link href="/sobre" className="site-link foco-anel">
                  {t("sobre")}
                </Link>
                <Link href="/#contato" scroll={false} onClick={aoClicarContato} className="site-link foco-anel">
                  {t("contato")}
                </Link>
              </nav>

              <LinkGitHub />

              <button
                onClick={alternarIdioma}
                className="site-idioma foco-anel"
                aria-label="Alternar idioma"
              >
                <Globe size={14} />
                {locale}
              </button>

              <SeletorTema />
            </div>

            {/* Mobile */}
            <div className="sm:hidden flex items-center gap-2">
              <button
                onClick={() => setBuscaAberta(true)}
                className="site-icone foco-anel"
                aria-label="Abrir busca"
              >
                <Search size={17} />
              </button>
              <button
                onClick={alternarIdioma}
                className="site-idioma foco-anel"
                aria-label="Alternar idioma"
              >
                <Globe size={13} />
                {locale}
              </button>
              <button
                className="site-icone foco-anel"
                onClick={() => setAberto(!aberto)}
                aria-label="Abrir menu"
                aria-expanded={aberto}
              >
                {aberto ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </header>

        {/* Menu mobile: irmão do <header> para não cair dentro do backdrop root dele */}
        {aberto && (
          <div className="site-menu sm:hidden flex flex-col gap-5 rounded-3xl p-6 shadow-2xl">
            <nav className="flex flex-col gap-4">
              <Link href="/projetos" onClick={() => setAberto(false)}>
                {t("projetos")}
              </Link>
              <Link href="/escritos" onClick={() => setAberto(false)}>
                {t("escritos")}
              </Link>
              <Link href="/sobre" onClick={() => setAberto(false)}>
                {t("sobre")}
              </Link>
              <Link href="/#contato" scroll={false} onClick={aoClicarContato}>
                {t("contato")}
              </Link>
            </nav>
            <div className="flex items-center justify-between">
              <LinkGitHub />
              <SeletorTema />
            </div>
          </div>
        )}
      </div>

      <ModalBusca aberto={buscaAberta} onFechar={() => setBuscaAberta(false)} />
    </>
  );
}
