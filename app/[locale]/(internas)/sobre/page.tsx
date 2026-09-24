import {
  listarRepositorios,
  listarEscritos,
  buscarDistribuicaoLinguagens,
  buscarCalendarioContribuicoes,
  buscarDadosUsuario,
} from "@/lib/github";
import { buscarPerfil, t2 } from "@/lib/perfil";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { metadataPagina, truncar } from "@/lib/seo";
import { StackTecnologias } from "@/components/sobre/StackTecnologias";
import { RetratoAvatar } from "@/components/sobre/RetratoAvatar";
import { CalendarioContribuicoes } from "@/components/sobre/CalendarioContribuicoes";
import { DistribuicaoLinguagens } from "@/components/sobre/DistribuicaoLinguagens";
import type { CSSProperties } from "react";

type Semana = { label: string; dias: { contagem: number }[] };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const perfil = await buscarPerfil();
  return metadataPagina({ locale, caminho: "/sobre", titulo: t("sobreTitulo"), descricao: truncar(t2(perfil.bio, locale)) });
}

export default async function Sobre({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations("sobre");

  const perfil = await buscarPerfil();

  const [usuario, repos, posts, calendario] = await Promise.all([
    buscarDadosUsuario(),
    listarRepositorios(),
    listarEscritos(locale),
    buscarCalendarioContribuicoes(),
  ]);

  const linguagens = await buscarDistribuicaoLinguagens(repos);
  const { atributos: a } = perfil;

  // foco tem texto longo e ocupa bloco largo; formação e base cabem em blocos simples
  const atributos: { label: string; value: string; apoio?: string; largo?: boolean }[] = [
    { label: "foco", value: t2(a.foco, locale), largo: true },
    { label: "formação", value: t2(a.formacaoCurso, locale), apoio: a.formacaoInstituicao },
    { label: "base", value: t2(a.base, locale) },
  ];

  const anoInicio = usuario?.created_at ? new Date(usuario.created_at).getFullYear() : new Date().getFullYear();
  const anosProducao = `${Math.max(1, new Date().getFullYear() - anoInicio)}+`;
  const sistemasAtivos = String(repos.length);

  const contribuicoesAno = calendario
    ? (calendario as Semana[]).reduce((soma, s) => soma + s.dias.reduce((a, d) => a + d.contagem, 0), 0)
    : null;

  const stats = [
    { valor: anosProducao, rotulo: "anos em produção" },
    { valor: sistemasAtivos, rotulo: "sistemas ativos" },
    { valor: String(posts.length), rotulo: "artigos escritos" },
    { valor: contribuicoesAno !== null ? String(contribuicoesAno) : "—", rotulo: "contribuições / ano" },
  ];

  // Ordem de entrada escalonada dos blocos (animação em .sobre-bento)
  let ordem = 0;
  const entrada = () => ({ "--i": ordem++ }) as CSSProperties;

  const blocoAtributo = (at: (typeof atributos)[number]) => (
    <div key={at.label} className={at.largo ? "box wide" : "box"} style={entrada()}>
      <div className="lbl">{at.label}</div>
      <div>
        <div className="sobre-valor">{at.value}</div>
        {at.apoio && <div className="lbl mt-1">{at.apoio}</div>}
      </div>
    </div>
  );

  return (
    <article className="conteudo w-full flex flex-col gap-8 pt-[84px] pb-16">
      <header>
        <p className="rotulo mb-3">perfil</p>
        <h1 className="heading-1">Sobre</h1>
      </header>

      <div className="raizes-bento sobre-bento">
        <div className="box big gap-6" style={entrada()}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <RetratoAvatar urlFoto={`https://github.com/${perfil.contato.github}.png`} />
            <div>
              <h2 className="raizes-bento-titulo mb-2">{perfil.nome}</h2>
              <p className="lbl">{t2(perfil.cargo, locale)}</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
            {t2(perfil.bio, locale)}
          </p>
          <div className="flex gap-3 items-center flex-wrap">
            <a
              href={`mailto:${perfil.contato.email}`}
              className="font-mono text-xs px-5 py-2.5 rounded-full font-semibold transition-opacity hover:opacity-90"
              style={{ background: "var(--accent)", color: "var(--on-accent)" }}
            >
              {t("contato")}
            </a>
            <a
              href="/curriculo.pdf"
              download
              className="font-mono text-xs px-5 py-2.5 rounded-full transition-colors"
              style={{ backgroundColor: "color-mix(in srgb, var(--ink) 8%, transparent)", color: "var(--ink)" }}
            >
              currículo
            </a>
          </div>
        </div>

        {stats.map((s) => (
          <div key={s.rotulo} className="box" style={entrada()}>
            <div className="num">{s.valor}</div>
            <div className="lbl">{s.rotulo}</div>
          </div>
        ))}

        {/* foco (largo) + formação + base fecham uma linha; a stack ocupa a linha seguinte inteira */}
        {atributos.map(blocoAtributo)}

        <div className="box full" style={entrada()}>
          <StackTecnologias tecnologias={perfil.tecnologias ?? []} locale={locale} />
        </div>

        <div className="box full" style={entrada()}>
          <DistribuicaoLinguagens dados={linguagens} />
        </div>

        <div className="box full" style={entrada()}>
          <CalendarioContribuicoes semanas={calendario} />
        </div>
      </div>
    </article>
  );
}
