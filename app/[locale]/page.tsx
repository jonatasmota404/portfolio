import { listarRepositorios, listarEscritos, buscarCalendarioContribuicoes, buscarContagemCommits } from "@/lib/github";
import { prepararNosRaizes, prepararLigacoes, prepararCalendario } from "@/lib/raizes";
import { HomeRaizes } from "@/components/raizes/HomeRaizes";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  // Buscar dados do GitHub
  const repos = await listarRepositorios();
  const calendario = await buscarCalendarioContribuicoes();
  const posts = await listarEscritos(locale);

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
  const calendarioArray = prepararCalendario(calendario);

  return <HomeRaizes nos={nos} ligacoes={ligacoes} calendario={calendarioArray} posts={posts} totalRepos={repos.length} />;
}