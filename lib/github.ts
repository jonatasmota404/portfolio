import matter from "gray-matter";
import type { Perfil } from "@/lib/perfil";

const GITHUB_USER = "jonatasmota404";
const REPO_ESCRITOS = "escritos";
const revalidateTime = process.env.NODE_ENV === "development" ? 0 : 3600;

function branchPara(repo: string): string {
  const emDesenvolvimento = process.env.NODE_ENV === "development";
  return emDesenvolvimento && repo === REPO_ESCRITOS ? "rascunho" : "main";
}

async function githubFetch(url: string, tags: string[] = []) {
  const resposta = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
    },
    next: { revalidate: revalidateTime, tags },
    cache: process.env.NODE_ENV === "development" ? "no-store" : "default",
  });
  if (!resposta.ok) throw new Error(`GitHub API falhou: ${resposta.status} (${url})`);
  return resposta.json();
}

export async function listarRepositorios() {
  const repos = await githubFetch(
    `https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=100`,
    ["repo:lista"]
  );
  return repos.filter((r: any) => r.topics?.includes("portfolio"));
}

export async function buscarArquivoRaw(
  repo: string,
  path: string,
  tagsExtras: string[] = []
): Promise<string> {
  const branch = branchPara(repo);

  const resposta = await fetch(
    `https://api.github.com/repos/${GITHUB_USER}/${repo}/contents/${path}?ref=${branch}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github.raw+json",
      },
      next: { revalidate: revalidateTime, tags: [`repo:${repo}`, ...tagsExtras] },
      cache: process.env.NODE_ENV === "development" ? "no-store" : "default",
    }
  );
  if (!resposta.ok) throw new Error(`Falha ao buscar ${path}: ${resposta.status}`);
  return resposta.text();
}

async function buscarArquivoRawOuNulo(repo: string, path: string): Promise<string | null> {
  try {
    return await buscarArquivoRaw(repo, path);
  } catch {
    return null;
  }
}

// Reescreve imagens relativas (![alt](imagens/foo.png)) pra URL real do GitHub,
// baseado no branch e na pasta onde o arquivo .mdx/.md realmente está.
function reescreverImagens(conteudo: string, repo: string, pastaBase: string): string {
  const baseUrl = `https://raw.githubusercontent.com/${GITHUB_USER}/${repo}/${branchPara(repo)}/${pastaBase}`;
  return conteudo.replace(
    /!\[([^\]]*)\]\((?!https?:\/\/)([^)]+)\)/g,
    (_match, alt, caminho) => `![${alt}](${baseUrl}${caminho})`
  );
}

// Remove comentários HTML que quebram o MDX (<!-- ... -->)
// Remove comentários HTML e força o fechamento de tags vazias (exigência do JSX/MDX)
function limparMarkdown(conteudo: string): string {
  return conteudo
    // 1. Remove comentários HTML (<!-- ... -->)
    .replace(/<!--[\s\S]*?-->/g, "")
    // 2. Encontra tags <img ...>, <br> e <hr> (com ou sem barra) e recria fechando corretamente (<img ... />)
    .replace(/<(img|br|hr)\b([^>]*?)\/?>/gi, "<$1$2 />");
}

// ---------- Perfil (perfil.json no repositório de perfil) ----------
// Retorna null em qualquer falha (API fora, 404, JSON inválido) — quem chama cai pro fallback local.

export async function buscarPerfilRemoto(): Promise<Perfil | null> {
  try {
    const bruto = await buscarArquivoRaw(GITHUB_USER, "perfil.json", [`perfil-${GITHUB_USER}`]);
    return JSON.parse(bruto) as Perfil;
  } catch {
    return null;
  }
}

// ---------- Projetos (README) ----------
// Padrão: inglês (README.md). Português é a tradução opcional (README.pt.md).

export async function buscarReadmeLocalizado(repo: string, locale: string): Promise<string | null> {
  let bruto: string | null;
  if (locale === "en") {
    bruto = await buscarArquivoRawOuNulo(repo, "README.md");
  } else {
    bruto = await buscarArquivoRawOuNulo(repo, `README.${locale}.md`); // README.pt.md
    if (!bruto) bruto = await buscarArquivoRawOuNulo(repo, "README.md"); // cai pro inglês se ainda não traduziu
  }
  
  if (!bruto) return null;

  // Limpa os comentários HTML do README antes de renderizar
  const limpo = limparMarkdown(bruto);
  return reescreverImagens(limpo, repo, "");
}

// ---------- Escritos (pasta por artigo) ----------
// Padrão: português (pt.mdx). Inglês é a tradução opcional (en.mdx).

async function listarPastasEscritos(): Promise<string[]> {
  try {
    const itens = await githubFetch(
      `https://api.github.com/repos/${GITHUB_USER}/${REPO_ESCRITOS}/contents/?ref=${branchPara(REPO_ESCRITOS)}`,
      [`repo:${REPO_ESCRITOS}`]
    );
    return itens.filter((i: any) => i.type === "dir").map((i: any) => i.name);
  } catch {
    return [];
  }
}

export async function listarEscritos(locale: string) {
  const pastas = await listarPastasEscritos();

  const posts = await Promise.all(
    pastas.map(async (slug) => {
      let bruto = await buscarArquivoRawOuNulo(REPO_ESCRITOS, `${slug}/${locale}.mdx`);
      if (!bruto) bruto = await buscarArquivoRawOuNulo(REPO_ESCRITOS, `${slug}/pt.mdx`); // fallback
      if (!bruto) return null;

      const { data } = matter(bruto);
      return { slug, ...(data as any) };
    })
  );

  return posts.filter((p): p is NonNullable<typeof p> => p !== null);
}

export async function buscarArtigo(slug: string, locale: string) {
  let bruto = await buscarArquivoRawOuNulo(REPO_ESCRITOS, `${slug}/${locale}.mdx`);
  if (!bruto) bruto = await buscarArquivoRawOuNulo(REPO_ESCRITOS, `${slug}/pt.mdx`);
  if (!bruto) return null;

  const { content, data } = matter(bruto);
  
  // Limpa os comentários HTML do Artigo antes de renderizar
  const limpo = limparMarkdown(content);
  const conteudoComImagens = reescreverImagens(limpo, REPO_ESCRITOS, `${slug}/`);
  
  return { content: conteudoComImagens, data };
}

export async function buscarCalendarioContribuicoes() {
  const query = `
    query($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            weeks {
              contributionDays { date contributionCount }
            }
          }
        }
      }
    }
  `;
  const resposta = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables: { login: GITHUB_USER } }),
    next: { revalidate: 3600, tags: ["calendario-contribuicoes"] },
  });

  if (!resposta.ok) return null;
  const json = await resposta.json();
  const semanas = json?.data?.user?.contributionsCollection?.contributionCalendar?.weeks;
  if (!semanas) return null;

  const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  let ultimoMes = -1;

  return semanas.map((semana: any) => {
    const primeiroDia = new Date(semana.contributionDays[0].date);
    const mes = primeiroDia.getMonth();
    const label = mes !== ultimoMes ? MESES[mes] : "";
    ultimoMes = mes;
    return {
      label,
      dias: semana.contributionDays.map((d: any) => ({ contagem: d.contributionCount })),
    };
  });
}

export async function buscarRepositoriosPinned(): Promise<string[]> {
  const query = `
    query($login: String!) {
      user(login: $login) {
        pinnedItems(first: 6, types: REPOSITORY) {
          nodes { ... on Repository { name } }
        }
      }
    }
  `;
  try {
    const resposta = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { login: GITHUB_USER } }),
      next: { revalidate: 3600, tags: ["repositorios-pinned"] },
    });
    if (!resposta.ok) return [];
    const json = await resposta.json();
    const nodes = json?.data?.user?.pinnedItems?.nodes;
    if (!Array.isArray(nodes)) return [];
    return nodes.map((n: any) => n?.name).filter(Boolean);
  } catch {
    return [];
  }
}

export async function buscarDistribuicaoLinguagens(repos: { name: string }[]) {
  const totais: Record<string, number> = {};

  await Promise.all(
    repos.map(async (repo) => {
      try {
        const dados = await githubFetch(
          `https://api.github.com/repos/${GITHUB_USER}/${repo.name}/languages`,
          [`repo:${repo.name}`]
        );
        for (const [linguagem, bytes] of Object.entries(dados)) {
          totais[linguagem] = (totais[linguagem] ?? 0) + (bytes as number);
        }
      } catch {
        // repositório sem dado de linguagem — ignora, não quebra o agregado
      }
    })
  );

  const totalGeral = Object.values(totais).reduce((a, b) => a + b, 0);
  if (totalGeral === 0) return [];

  const ordenado = Object.entries(totais)
    .map(([nome, bytes]) => ({ nome, pct: Math.round((bytes / totalGeral) * 100) }))
    .sort((a, b) => b.pct - a.pct);

  const principais = ordenado.slice(0, 3);
  const restante = ordenado.slice(3).reduce((soma, l) => soma + l.pct, 0);
  return restante > 0 ? [...principais, { nome: "Outros", pct: restante }] : principais;
}

export async function buscarDadosUsuario() {
  const user = await githubFetch(`https://api.github.com/users/${GITHUB_USER}`);
  return user; // Retorna created_at, public_repos, followers, etc.
}

export async function buscarContagemCommits(repo: string): Promise<number> {
  try {
    const resposta = await fetch(
      `https://api.github.com/repos/${GITHUB_USER}/${repo}/commits?per_page=1`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
        },
        next: { revalidate: revalidateTime, tags: [`repo:${repo}`] },
        cache: process.env.NODE_ENV === "development" ? "no-store" : "default",
      }
    );
    if (!resposta.ok) return 0;
    const link = resposta.headers.get("link");
    if (!link) return 1;
    const match = link.match(/page=(\d+)>; rel="last"/);
    return match ? parseInt(match[1], 10) : 1;
  } catch {
    return 0;
  }
}