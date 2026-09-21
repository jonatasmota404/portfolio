import { MDXRemote } from "next-mdx-remote/rsc";
import {
  buscarSobre,
  listarRepositorios,
  listarEscritos,
  buscarDistribuicaoLinguagens,
  buscarCalendarioContribuicoes,
  buscarDadosUsuario,
} from "@/lib/github";
import { calcularHabilidades } from "@/lib/habilidades";
import { extrairSecoesReadme, extrairBullets, extrairCargo } from "@/lib/readme-secoes";
import { getTranslations } from "next-intl/server";
import { PainelDireito } from "@/components/codex/PainelDireito";
import { CartaoIdentidade } from "@/components/codex/CartaoIdentidade";
import { componentesProsa } from "@/components/codex/prosa";

const GITHUB_USER = "jonatasmota404";
type Semana = { label: string; dias: { contagem: number }[] };

export default async function Sobre({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations("sobre");

  const [usuario, readme, repos, posts, calendario] = await Promise.all([
    buscarDadosUsuario(),
    buscarSobre(locale),
    listarRepositorios(),
    listarEscritos(locale),
    buscarCalendarioContribuicoes(),
  ]);

  const linguagens = await buscarDistribuicaoLinguagens(repos);
  const habilidades = calcularHabilidades(repos, posts);
  const { introducao, secoes } = readme ? extrairSecoesReadme(readme) : { introducao: "", secoes: [] };
  const { cargo, corpo: corpoIntroducao } = extrairCargo(introducao);

  const bulletsAbout = extrairBullets(secoes[0]?.corpo ?? "");
  const bulletsAtual = extrairBullets(secoes[1]?.corpo ?? "");
  const focoBruto = bulletsAtual[0] ?? "";

  const atributos = [
    { label: "stack", value: bulletsAbout[1] ?? "" },
    { label: "foco", value: focoBruto.includes(" — ") ? focoBruto.split(" — ")[1] : focoBruto },
    { label: "formação", value: bulletsAbout[2] ?? "" },
    { label: "base", value: bulletsAbout[3] ?? "" },
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
    <article className="w-full flex flex-col gap-6 pt-2">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        
        {/* COLUNA ESQUERDA */}
        <div className="xl:col-span-4 flex flex-col gap-6 min-w-0 h-full">
          <CartaoIdentidade
            nome="Jônatas Júnior"
            cargo={cargo}
            detalhes={corpoIntroducao && <MDXRemote source={corpoIntroducao} components={componentesProsa} />}
            avatarUrl={`https://github.com/${GITHUB_USER}.png`}
            rotuloContato={t("contato")}
          />
          
          <div className="mundo-painel border rounded-3xl p-7 shadow-sm flex-1">
            <p className="text-[11px] uppercase tracking-widest opacity-60 font-mono mb-4">atributos</p>
            <div className="flex flex-col gap-3">
              {atributos.map((a) => (
                <div key={a.label} className="grid grid-cols-[75px_1fr] gap-3 items-baseline">
                  <span className="text-xs font-mono" style={{ color: "#C1571F" }}>{a.label}</span>
                  <span className="font-voice text-sm leading-relaxed opacity-90">{a.value}</span>
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