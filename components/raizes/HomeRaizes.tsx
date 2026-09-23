"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { calcularCamerasSecoes, type CameraSecao, type NoRepo } from "@/lib/raizes";
import { rolarSuaveAte, rolarSuaveAteComEspera } from "@/lib/scroll";
import { NomeCinetico } from "./NomeCinetico";
import { CursorCustom } from "./CursorCustom";
import { BotoesMagneticos } from "./BotoesMagneticos";

const CenaRaizes = dynamic(() => import("./CenaRaizes").then((m) => ({ default: m.CenaRaizes })), {
  ssr: false,
});

interface Props {
  nos: NoRepo[];
  ligacoes: Array<{ a: string; b: string; forte: boolean }>;
  posts: any[];
  totalRepos: number;
  githubUser: string;
  formacao: { curso: string; instituicao: string };
  disponibilidade: string;
  contribuicoes: number | null;
}

// Formato lido pelo scroll handler: "px,py,pz|tx,ty,tz".
function camAttr(c: CameraSecao): string {
  return `${c.position.join(",")}|${c.target.join(",")}`;
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

export function HomeRaizes({
  nos,
  ligacoes,
  posts,
  totalRepos,
  githubUser,
  formacao,
  disponibilidade,
  contribuicoes,
}: Props) {
  const t = useTranslations("home");
  const cameraRef = useRef<{
    position: { x: number; y: number; z: number };
    target: { x: number; y: number; z: number };
  }>({
    position: { x: 0, y: 30, z: 50 },
    target: { x: 0, y: 0, z: 0 },
  });

  const [scrollProgress, setScrollProgress] = useState(0);

  // Proporção real da tela: em retrato (mobile) o FOV horizontal é bem mais
  // estreito, então as câmeras precisam recuar para enquadrar os destaques.
  const [aspect, setAspect] = useState(16 / 9);
  useEffect(() => {
    const atualizar = () => setAspect(window.innerWidth / Math.max(1, window.innerHeight));
    atualizar();
    window.addEventListener("resize", atualizar);
    return () => window.removeEventListener("resize", atualizar);
  }, []);
  const cameras = useMemo(() => calcularCamerasSecoes(nos, aspect), [nos, aspect]);

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
    // Refaz a leitura quando as câmeras são recalculadas (resize), sem esperar o próximo scroll.
  }, [cameras]);

  // Chegou na Home com uma âncora na URL (ex.: navegação vinda de outra página via "/#contato") — rola até a seção assim que ela existir.
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash) rolarSuaveAteComEspera(hash);
  }, []);

  const destaques = nos.filter((n) => n.destaque);
  const tecnologias = tagsMaisComuns(nos, 8);

  return (
    <>
      <CenaRaizes nos={nos} ligacoes={ligacoes} camAlvo={cameraRef} />
      <CursorCustom />
      <BotoesMagneticos />

      <div className="relative z-10">
        {/* Hero */}
        <section
          id="hero"
          className="min-h-screen flex flex-col items-start justify-end px-6 md:px-16"
          style={{ paddingTop: "84px", paddingBottom: "100px" }}
          data-cam={camAttr(cameras.hero)}
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
              <a
                href="#projetos"
                className="raizes-btn raizes-btn-pri mag"
                onClick={(e) => {
                  e.preventDefault();
                  rolarSuaveAte("projetos");
                }}
              >
                Ver projetos
              </a>
              <a
                href="#escritos"
                className="raizes-btn mag"
                onClick={(e) => {
                  e.preventDefault();
                  rolarSuaveAte("escritos");
                }}
              >
                Ler escritos
              </a>
            </div>
          </div>
          <div className="raizes-scrollhint">role para explorar ↓</div>
        </section>

        {/* Bio + Stats */}
        <section id="bio" aria-label="Quem sou" className="raizes-secao raizes-secao-centro" data-cam={camAttr(cameras.bio)}>
          <div className="raizes-bento-wrap">
            <div className="raizes-bento">
              <div className="box big">
                <div>
                  <h2 className="raizes-bento-titulo mb-3">
                    {t("quemSouTitulo")}
                  </h2>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                    {t("descricao")}
                  </p>
                </div>
                <a
                  href={`https://github.com/${githubUser}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lbl"
                  style={{ textDecoration: "none" }}
                >
                  {githubUser} · GitHub
                </a>
              </div>
              <div className="box">
                <div className="num">{totalRepos}</div>
                <div className="lbl">repositórios ({destaques.length} destaques)</div>
              </div>
              <div className="box">
                <div className="num">{posts.length}</div>
                <div className="lbl">artigos escritos</div>
              </div>
              <div className="box wide">
                <div className="num">{contribuicoes ?? "—"}</div>
                <div className="lbl">contribuições no período mostrado</div>
              </div>
              <div className="box wide">
                <div className="lbl mb-3">stack do dia a dia</div>
                <div className="flex flex-wrap gap-2">
                  {tecnologias.map((tag) => (
                    <span key={tag} className="raizes-chip">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="box">
                <div style={{ fontFamily: "var(--font-tight), sans-serif", fontWeight: 800, fontSize: 15, color: "var(--ink)" }}>
                  {formacao.curso}
                </div>
                <div className="lbl">{formacao.instituicao}</div>
              </div>
              <div className="box">
                <div
                  className="flex items-center"
                  style={{ fontFamily: "var(--font-tight), sans-serif", fontWeight: 800, fontSize: 15, color: "var(--ink)" }}
                >
                  <span className="dotp" aria-hidden="true" />
                  {t("abertoVagas")}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono), monospace",
                    fontSize: 12,
                    color: "var(--muted)",
                    letterSpacing: "0.06em",
                    textTransform: "none",
                    fontWeight: 400,
                  }}
                >
                  {disponibilidade}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Destaques */}
        <section id="projetos" className="raizes-secao raizes-secao-dir" data-cam={camAttr(cameras.projetos)}>
          <div className="raizes-panel raizes-largura-padrao p-8 md:p-10">
            <h2 className="raizes-h2" style={{ fontSize: "clamp(28px, 4.5vw, 52px)" }}>
              Projetos em destaque
            </h2>
            <p className="text-sm mt-4 leading-relaxed" style={{ color: "var(--muted)" }}>
              Os destaques são os nós grandes. Os outros repositórios ficam espalhados pela rede: passe o mouse (ou
              toque) para ver as conexões e os últimos commits.
            </p>
            <div className="raizes-pcs">
              {destaques.map((no) => (
                <Link
                  key={no.id}
                  href={`/projetos/${no.id}`}
                  className="raizes-pc"
                  onMouseEnter={() =>
                    window.dispatchEvent(new CustomEvent("raizes:hover-projeto", { detail: { id: no.id } }))
                  }
                  onMouseLeave={() =>
                    window.dispatchEvent(new CustomEvent("raizes:hover-projeto", { detail: { id: null } }))
                  }
                >
                  <span className="go">→</span>
                  <b>{no.nome}</b>
                  <small>{no.tags.join(" · ")}</small>
                </Link>
              ))}
            </div>
            <div className="mt-8">
              <Link href="/projetos" className="raizes-btn mag">
                Ver todos →
              </Link>
            </div>
          </div>
        </section>

        {/* Como trabalho */}
        <section id="como-trabalho" className="raizes-secao raizes-secao-esq" data-cam={camAttr(cameras["como-trabalho"])}>
          <div className="raizes-panel raizes-largura-padrao p-8 md:p-10">
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
        <section id="escritos" className="raizes-secao raizes-secao-dir" data-cam={camAttr(cameras.escritos)}>
          <div className="raizes-largura-padrao">
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
                      className="painel block p-6 rounded-2xl hover:border-[var(--accent)] transition-all group"
                    >
                      <h3 className="heading-3 text-lg mb-2 group-hover:translate-x-1 transition-transform">
                        {post.titulo || post.slug}
                      </h3>
                      <p className="apoio text-sm">{post.descricao || ""}</p>
                      <div className="rotulo mt-4">{post.data || ""}</div>
                    </Link>
                  ))}
                </div>
                <div className="text-center">
                  <Link href="/escritos" className="raizes-btn mag">
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
          id="contato"
          className="raizes-secao raizes-secao-centro text-center"
          data-cam={camAttr(cameras.contato)}
        >
          <div className="raizes-panel px-8 py-10 md:px-12 md:py-14 max-w-3xl">
            <h2 className="raizes-contato-h2 mb-6">Vamos conversar</h2>
            <p className="text-sm max-w-lg mx-auto mb-8" style={{ color: "var(--muted)" }}>
              Tenho interesse em projetos de infraestrutura, arquitetura e troubleshooting. Sempre aberto a conversar
              sobre sistemas resilientes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:jonatasjr.019@gmail.com" className="raizes-btn raizes-btn-pri mag">
                E-mail
              </a>
              <a
                href="https://github.com/jonatasmota404"
                target="_blank"
                rel="noopener noreferrer"
                className="raizes-btn mag"
              >
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/jonatas-jr/"
                target="_blank"
                rel="noopener noreferrer"
                className="raizes-btn mag"
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
