"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import type { NoRepo } from "@/lib/raizes";

const CenaRaizes = dynamic(() => import("./CenaRaizes").then((m) => ({ default: m.CenaRaizes })), {
  ssr: false,
});

interface Props {
  nos: NoRepo[];
  ligacoes: Array<{ a: string; b: string; forte: boolean }>;
  calendario: number[];
  posts: any[];
  totalRepos: number;
}

export function HomeRaizes({ nos, ligacoes, calendario, posts, totalRepos }: Props) {
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

  return (
    <>
      <CenaRaizes nos={nos} ligacoes={ligacoes} calendario={calendario} camAlvo={cameraRef} />

      <div className="relative z-10">
        {/* Hero */}
        <section
          className="min-h-screen flex flex-col items-center justify-center text-center px-4"
          data-cam="0,30,50|0,0,0"
        >
          <div className="mundo-painel rounded-3xl px-8 py-10 md:px-12 md:py-14 max-w-2xl">
            <p className="font-mono text-xs mb-4 opacity-70">{t("tagline")}</p>
            <h1 className="font-voice italic text-4xl md:text-5xl mb-6">{t("titulo")}</h1>
            <p className="text-sm opacity-70 max-w-lg mx-auto mb-12">{t("descricao")}</p>
            <div className="flex gap-4 justify-center">
              <Link href="/projetos" className="px-6 py-2 rounded-full border transition-all hover:bg-current/10">
                Ver projetos
              </Link>
              <a href="#bio" className="px-6 py-2 rounded-full bg-current/10">
                Saiba mais
              </a>
            </div>
          </div>
        </section>

        {/* Bio + Stats */}
        <section id="bio" className="py-20 px-4" data-cam="-20,25,40|0,10,0">
          <div className="max-w-2xl mx-auto mundo-painel rounded-3xl p-8 md:p-10">
            <h2 className="font-voice italic text-2xl mb-6">Quem sou</h2>
            <p className="opacity-75 mb-6 text-sm leading-relaxed">
              Engenheiro de software com foco em infraestrutura e confiabilidade. Construo sistemas que precisam escalar,
              falhar graciosamente e se recuperar. Experiência full-stack: Node.js/TypeScript, React, Kubernetes,
              observabilidade.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-8">
              <div>
                <div className="font-mono text-2xl font-bold text-accent">{totalRepos}</div>
                <div className="text-xs opacity-60 uppercase tracking-wider">Repositórios</div>
              </div>
              <div>
                <div className="font-mono text-2xl font-bold text-accent">{posts.length}</div>
                <div className="text-xs opacity-60 uppercase tracking-wider">Artigos</div>
              </div>
              <div>
                <div className="font-mono text-2xl font-bold text-accent">7+</div>
                <div className="text-xs opacity-60 uppercase tracking-wider">Anos na área</div>
              </div>
            </div>
          </div>
        </section>

        {/* Destaques */}
        <section className="py-20 px-4" data-cam="25,20,35|-10,5,0">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-voice italic text-2xl mb-8">Projetos em destaque</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {destaques.map((no) => (
                <Link
                  key={no.id}
                  href={`/projetos/${no.id}`}
                  className="mundo-painel p-6 rounded-lg border hover:border-current/50 transition-all group"
                  style={{ borderColor: `hsl(${no.hue}, 60%, 50%)` }}
                >
                  <h3 className="font-voice italic text-lg mb-2 group-hover:translate-x-1 transition-transform">
                    {no.nome}
                  </h3>
                  <p className="text-sm opacity-70 mb-4">{no.descricao}</p>
                  <div className="flex justify-between text-xs opacity-50">
                    <span>{no.commits} commits</span>
                    {no.tags.length > 0 && <span>{no.tags.join(", ")}</span>}
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href="/projetos" className="inline-block px-6 py-2 rounded-full border hover:bg-current/10 transition-all">
                Ver todos →
              </Link>
            </div>
          </div>
        </section>

        {/* Como trabalho */}
        <section className="py-20 px-4" data-cam="-30,25,30|0,0,10">
          <div className="max-w-2xl mx-auto mundo-painel rounded-3xl p-8 md:p-10">
            <h2 className="font-voice italic text-2xl mb-8">Como trabalho</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-mono text-sm font-bold uppercase mb-2">Observabilidade primeiro</h3>
                <p className="text-sm opacity-70">
                  Se não consigo medir, não consigo entender. Logs, métricas e traces são o alicerce de qualquer
                  sistema que eu construo.
                </p>
              </div>
              <div>
                <h3 className="font-mono text-sm font-bold uppercase mb-2">Resiliência por design</h3>
                <p className="text-sm opacity-70">
                  Falhas são inevitáveis. Componentes isolados, circuit breakers, retry policies e timeouts
                  inteligentes não são opcionais.
                </p>
              </div>
              <div>
                <h3 className="font-mono text-sm font-bold uppercase mb-2">Automatização obsessiva</h3>
                <p className="text-sm opacity-70">
                  Testes, deploys, backups, alertas — qualquer processo manual que se repete é um bug esperando
                  acontecer.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Escritos */}
        <section className="py-20 px-4" data-cam="20,20,40|0,5,5">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-voice italic text-2xl mb-8">Últimos escritos</h2>
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
                  <Link href="/escritos" className="inline-block px-6 py-2 rounded-full border hover:bg-current/10 transition-all">
                    Ver todos os artigos →
                  </Link>
                </div>
              </>
            ) : (
              <p className="text-sm opacity-70">Nenhum artigo ainda. Voltando em breve.</p>
            )}
          </div>
        </section>

        {/* Contato */}
        <section className="min-h-screen flex flex-col items-center justify-center px-4 text-center" data-cam="0,40,50|0,20,0">
          <div className="mundo-painel rounded-3xl px-8 py-10 md:px-12 md:py-14 max-w-2xl">
            <h2 className="font-voice italic text-3xl mb-6">Vamos conversar</h2>
            <p className="text-sm opacity-70 max-w-lg mx-auto mb-8">
              Tenho interesse em projetos de infraestrutura, arquitetura e troubleshooting. Sempre aberto a conversar
              sobre sistemas resilientes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:jonatasjr.019@gmail.com"
                className="px-6 py-3 rounded-full border hover:bg-current/10 transition-all"
              >
                E-mail
              </a>
              <a
                href="https://github.com/jonatasmota404"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-full border hover:bg-current/10 transition-all"
              >
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/jonatas-jr/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-full border hover:bg-current/10 transition-all"
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
