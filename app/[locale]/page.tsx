import {
  listarRepositorios,
  listarEscritos,
  buscarContagemCommits,
  buscarCalendarioContribuicoes,
  buscarRepositoriosPinned,
} from "@/lib/github";
import { buscarPerfil, t2 } from "@/lib/perfil";
import { prepararNosRaizes, prepararLigacoes } from "@/lib/raizes";
import { HomeRaizes } from "@/components/raizes/HomeRaizes";

const GITHUB_USER = "jonatasmota404";
type Semana = { label: string; dias: { contagem: number }[] };

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  // Buscar dados do GitHub
  const repos = await listarRepositorios();
  const posts = await listarEscritos(locale);
  const [calendario, pinned] = await Promise.all([
    buscarCalendarioContribuicoes(),
    buscarRepositoriosPinned(),
  ]);

  const perfil = buscarPerfil();
  const formacao = {
    curso: t2(perfil.atributos.formacaoCurso, locale),
    instituicao: perfil.atributos.formacaoInstituicao.split(" — ")[0],
  };
  const disponibilidade = t2(perfil.disponibilidade.local, locale);

  const contribuicoesPeriodo = calendario
    ? (calendario as Semana[]).reduce((soma, s) => soma + s.dias.reduce((a, d) => a + d.contagem, 0), 0)
    : null;

  // Buscar contagem de commits dos repositórios em destaque (pinned, ou os 5 mais recentes se não houver pinned)
  const pinnedSet = new Set(pinned);
  const reposDestaque = pinned.length > 0 ? repos.filter((r: any) => pinnedSet.has(r.name)) : repos.slice(0, 5);
  const contagensCommits = await Promise.all(
    reposDestaque.map((r: any) => buscarContagemCommits(r.name))
  ).then((contagens) => {
    const record: Record<string, number> = {};
    reposDestaque.forEach((r: any, idx: number) => {
      record[r.name] = contagens[idx];
    });
    return record;
  });

  // Preparar dados para a cena
  const nos = prepararNosRaizes(repos, contagensCommits, pinned);
  const ligacoes = prepararLigacoes(nos);

  return (
    <HomeRaizes
      nos={nos}
      ligacoes={ligacoes}
      posts={posts}
      totalRepos={repos.length}
      githubUser={GITHUB_USER}
      formacao={formacao}
      disponibilidade={disponibilidade}
      contribuicoes={contribuicoesPeriodo}
    />
  );
}