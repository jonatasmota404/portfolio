import {
  listarRepositorios,
  listarEscritos,
  buscarDistribuicaoLinguagens,
  buscarCalendarioContribuicoes,
  buscarDadosUsuario,
} from "@/lib/github";
import { calcularHabilidades } from "@/lib/habilidades";
import { buscarPerfil, t2 } from "@/lib/perfil";
import { getTranslations } from "next-intl/server";
import { PainelDireito } from "@/components/sobre/PainelDireito";
import { CartaoIdentidade } from "@/components/sobre/CartaoIdentidade";

type Semana = { label: string; dias: { contagem: number }[] };

export default async function Sobre({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations("sobre");

  const perfil = buscarPerfil();

  const [usuario, repos, posts, calendario] = await Promise.all([
    buscarDadosUsuario(),
    listarRepositorios(),
    listarEscritos(locale),
    buscarCalendarioContribuicoes(),
  ]);

  const linguagens = await buscarDistribuicaoLinguagens(repos);
  const habilidades = calcularHabilidades(repos, posts);
  const { atributos: a } = perfil;

  const atributos = [
    { label: "stack", value: t2(a.stack, locale) },
    { label: "foco", value: t2(a.foco, locale) },
    { label: "formação", value: `${t2(a.formacaoCurso, locale)} (${a.formacaoInstituicao})` },
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

  return (
    <article className="conteudo w-full flex flex-col gap-8 pt-[84px] pb-16">
      <header>
        <p className="rotulo mb-3">perfil</p>
        <h1 className="heading-1">Sobre</h1>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        
        {/* COLUNA ESQUERDA */}
        <div className="xl:col-span-4 flex flex-col gap-6 min-w-0 h-full">
          <CartaoIdentidade
            nome={perfil.nome}
            cargo={t2(perfil.cargo, locale)}
            detalhes={<p>{t2(perfil.bio, locale)}</p>}
            avatarUrl={`https://github.com/${perfil.contato.github}.png`}
            rotuloContato={t("contato")}
          />
          
          <div className="painel rounded-3xl p-7 shadow-sm flex-1">
            <p className="rotulo mb-4">atributos</p>
            <div className="flex flex-col gap-3">
              {atributos.map((a) => (
                <div key={a.label} className="grid grid-cols-[75px_1fr] gap-3 items-baseline">
                  <span className="text-xs font-mono" style={{ color: "var(--accent)" }}>{a.label}</span>
                  <span className="text-sm leading-relaxed opacity-90">{a.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: Caixa Única e Consolidada */}
        <div className="xl:col-span-8 flex flex-col min-w-0 h-full">
          <PainelDireito 
            habilidades={habilidades} 
            stats={stats} 
            calendario={calendario} 
            linguagens={linguagens} 
          />
        </div>

      </div>
    </article>
  );
}