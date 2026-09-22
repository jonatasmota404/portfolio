import {
  listarRepositorios,
  listarEscritos,
  buscarContagemCommits,
  buscarSobre,
  buscarCalendarioContribuicoes,
} from "@/lib/github";
import { extrairSecoesReadme, extrairBullets } from "@/lib/readme-secoes";
import { prepararNosRaizes, prepararLigacoes } from "@/lib/raizes";
import { HomeRaizes } from "@/components/raizes/HomeRaizes";

const GITHUB_USER = "jonatasmota404";
type Semana = { label: string; dias: { contagem: number }[] };

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  // Buscar dados do GitHub
  const repos = await listarRepositorios();
  const posts = await listarEscritos(locale);
  const [readme, calendario] = await Promise.all([buscarSobre(locale), buscarCalendarioContribuicoes()]);

  const { secoes } = readme ? extrairSecoesReadme(readme) : { secoes: [] };
  const bulletsAbout = extrairBullets(secoes[0]?.corpo ?? "");
  const formacao = bulletsAbout[2] ?? "";
  const disponibilidade = bulletsAbout[3] ?? "";

  const contribuicoesPeriodo = calendario
    ? (calendario as Semana[]).reduce((soma, s) => soma + s.dias.reduce((a, d) => a + d.contagem, 0), 0)
    : null;

  // Buscar contagem de commits dos 5 destaques
  const contagensCommits = await Promise.all(
    repos.slice(0, 5).map((r: any) => buscarContagemCommits(r.name))
  ).then((contagens) => {
    const record: Record<string, number> = {};
    repos.slice(0, 5).forEach((r: any, idx: number) => {
      record[r.name] = contagens[idx];
    });
    return record;
  });

  // Preparar dados para a cena
  const nos = prepararNosRaizes(repos, contagensCommits);
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