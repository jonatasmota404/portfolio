"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import type { NoRepo } from "@/lib/raizes";
import { NomeCinetico } from "./NomeCinetico";

const CenaRaizes = dynamic(() => import("./CenaRaizes").then((m) => ({ default: m.CenaRaizes })), {
  ssr: false,
});

interface Props {
  nos: NoRepo[];
  ligacoes: Array<{ a: string; b: string; forte: boolean }>;
  posts: any[];
  totalRepos: number;
}

// Tags mais frequentes entre os nós — alimenta os chips do bento.
function tagsMaisComuns(nos: NoRepo[], limite: number): string[] {
  const contagem = new Map<string, number>();
  nos.flatMap((n) => n.tags).forEach((t) => contagem.set(t, (contagem.get(t) ?? 0) + 1));
  return [...contagem.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limite)
    .map(([tag]) => tag);
}

export function HomeRaizes({ nos, ligacoes, posts, totalRepos }: Props) {
  const t = useTranslations("home");
  const cameraRef = useRef<{
    position: { x: number; y: number; z: number };
    target: { x: number; y: number; z: number };
  }>({
    position: { x: 0, y: 30, z: 50 },
    target: { x: 0, y: 0, z: 0 },
  });

  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY / docHeight;
      setScrollProgress(scrolled);

      // Interpolar câmera entre seções (dados-cam)
      const secoes = Array.from(document.querySelectorAll("[data-cam]")) as HTMLElement[];
      if (secoes.length === 0) return;

      // Achar qual seção está visível
      const scrollY = window.scrollY + window.innerHeight / 2;
      let seçãoAtual = secoes[0];
      for (const sec of secoes) {
        if (sec.getBoundingClientRect().top < window.innerHeight / 2) {
          seçãoAtual = sec;
        }
      }

      const camData = seçãoAtual.getAttribute("data-cam");
      if (camData) {
        const [posStr, targetStr] = camData.split("|");
        const [px, py, pz] = posStr.split(",").map(Number);
        const [tx, ty, tz] = targetStr.split(",").map(Number);
        cameraRef.current = {
          position: { x: px, y: py, z: pz },
          target: { x: tx, y: ty, z: tz },
        };
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const destaques = nos.filter((n) => n.destaque);
  const tecnologias = tagsMaisComuns(nos, 8);

  return (
    <>
      <CenaRaizes nos={nos} ligacoes={ligacoes} camAlvo={cameraRef} />

      <div className="relative z-10">
        {/* Hero */}
        <section
          id="hero"
          className="min-h-screen flex flex-col items-start justify-end px-6 md:px-16"
          style={{ paddingTop: "40px", paddingBottom: "100px" }}
          data-cam="0,3,19.8|0,0,0"
        >
          <div className="w-full">
            <NomeCinetico texto="Jônatas Mota" />
            <p className="raizes-hero-tag mt-5 mb-7">{t("heroTagline")}</p>
            <div className="mb-9">
              <div className="raizes-live">
                <i />
                <span>cada nó é um repositório meu</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <a href="#projetos" className="raizes-btn raizes-btn-pri">
                Ver projetos
              </a>
              <a href="#escritos" className="raizes-btn">
                Ler escritos
              </a>
            </div>
          </div>
          <div className="raizes-scrollhint">role para explorar ↓</div>
        </section>

        {/* Bio + Stats */}
        <section id="bio" className="py-20 px-4" data-cam="-12.8,6,7.4|0,2,0">
          <div className="max-w-4xl mx-auto">
            <h2 className="raizes-h2 mb-8" style={{ fontSize: "clamp(28px, 4.5vw, 52px)" }}>
              Quem sou
            </h2>
            <div className="raizes-bento">
              <div className="box big">
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                  Engenheiro de software com foco em infraestrutura e confiabilidade. Construo sistemas que precisam
                  escalar, falhar graciosamente e se recuperar. Experiência full-stack: Node.js/TypeScript, React,
                  Kubernetes, observabilidade.
                </p>
              </div>
              <div className="box">
                <div className="num">{totalRepos}</div>
                <div className="lbl">Repositórios</div>
              </div>
              <div className="box">
                <div className="num">{posts.length}</div>
                <div className="lbl">Artigos</div>
              </div>
              <div className="box wide">
                <div className="lbl mb-3">Tecnologias</div>
                <div className="flex flex-wrap gap-2">
                  {tecnologias.map((tag) => (
                    <span key={tag} className="raizes-chip">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Destaques */}
        <section id="projetos" className="py-20 px-4" data-cam="10.8,-4,18.7|-4,0,0">
          <div className="max-w-3xl mx-auto raizes-panel p-8 md:p-10">
            <h2 className="raizes-h2" style={{ fontSize: "clamp(28px, 4.5vw, 52px)" }}>
              Projetos em destaque
            </h2>
            <p className="text-sm mt-4 leading-relaxed" style={{ color: "var(--muted)" }}>
              Os destaques são os nós grandes. Os outros repositórios ficam espalhados pela rede: passe o mouse (ou
              toque) para ver as conexões e os últimos commits.
            </p>
            <div className="raizes-pcs">
              {destaques.map((no) => (
                <Link key={no.id} href={`/projetos/${no.id}`} className="raizes-pc">
                  <span className="go">→</span>
                  <b>{no.nome}</b>
                  <small>{no.tags.join(" · ")}</small>
                </Link>
              ))}
            </div>
            <div className="mt-8">
              <Link href="/projetos" className="raizes-btn">
                Ver todos →
              </Link>
            </div>
          </div>
        </section>

        {/* Como trabalho */}
        <section className="py-20 px-4" data-cam="4.3,7,-11.9|0,1,0">
          <div className="max-w-2xl mx-auto raizes-panel p-8 md:p-10">
            <h2 className="raizes-h2 mb-8" style={{ fontSize: "clamp(28px, 4.5vw, 52px)" }}>
              Como trabalho
            </h2>
            <div className="raizes-hab">
              <b>Observabilidade primeiro</b>
              <span className="text-sm" style={{ opacity: 0.85 }}>
                Se não consigo medir, não consigo entender. Logs, métricas e traces são o alicerce de qualquer sistema
                que eu construo.
              </span>
            </div>
            <div className="raizes-hab">
              <b>Resiliência por design</b>
              <span className="text-sm" style={{ opacity: 0.85 }}>
                Falhas são inevitáveis. Componentes isolados, circuit breakers, retry policies e timeouts inteligentes
                não são opcionais.
              </span>
            </div>
            <div className="raizes-hab" style={{ marginBottom: 0 }}>
              <b>Automatização obsessiva</b>
              <span className="text-sm" style={{ opacity: 0.85 }}>
                Testes, deploys, backups, alertas — qualquer processo manual que se repete é um bug esperando
                acontecer.
              </span>
            </div>
          </div>
        </section>

        {/* Escritos */}
        <section id="escritos" className="py-20 px-4" data-cam="-9,-6,15.6|2,2,0">
          <div className="max-w-4xl mx-auto">
            <h2 className="raizes-h2 mb-8" style={{ fontSize: "clamp(28px, 4.5vw, 52px)" }}>
              {t("escritosTitulo")}
            </h2>
            {posts.length > 0 ? (
              <>
                <div className="space-y-6 mb-8">
                  {posts.slice(0, 3).map((post) => (
                    <Link
                      key={post.slug}
                      href={`/escritos/${post.slug}`}
                      className="mundo-painel block p-6 rounded-lg border border-current/20 hover:border-current/50 transition-all group"
                    >
                      <h3 className="font-voice italic text-lg mb-2 group-hover:translate-x-1 transition-transform">
                        {post.titulo || post.slug}
                      </h3>
                      <p className="text-sm opacity-70">{post.descricao || ""}</p>
                      <div className="text-xs opacity-50 mt-4">{post.data || ""}</div>
                    </Link>
                  ))}
                </div>
                <div className="text-center">
                  <Link href="/escritos" className="raizes-btn">
                    {t("verTodos")}
                  </Link>
                </div>
              </>
            ) : (
              <p className="text-sm opacity-70">Nenhum artigo ainda. Voltando em breve.</p>
            )}
          </div>
        </section>

        {/* Contato */}
        <section
          className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
          data-cam="19.4,10,7.1|0,3,0"
        >
          <div className="raizes-panel px-8 py-10 md:px-12 md:py-14 max-w-3xl">
            <h2 className="raizes-contato-h2 mb-6">Vamos conversar</h2>
            <p className="text-sm max-w-lg mx-auto mb-8" style={{ color: "var(--muted)" }}>
              Tenho interesse em projetos de infraestrutura, arquitetura e troubleshooting. Sempre aberto a conversar
              sobre sistemas resilientes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:jonatasjr.019@gmail.com" className="raizes-btn raizes-btn-pri">
                E-mail
              </a>
              <a
                href="https://github.com/jonatasmota404"
                target="_blank"
                rel="noopener noreferrer"
                className="raizes-btn"
              >
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/jonatas-jr/"
                target="_blank"
                rel="noopener noreferrer"
                className="raizes-btn"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
