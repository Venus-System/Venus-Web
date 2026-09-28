import { URL_API } from "../../config/ambiente";
import type { NivelRecomendacao } from "../../types/analise";
import type {
  AnaliseRecente,
  ContagemPorPeriodo,
  Painel,
  ProdutoDoPainel,
  ResumoDasAnalises,
} from "../../types/painel";
import { comoObjeto, numero, texto } from "./leitura";
import { buscarProdutoPorIdDaApi } from "./produtos";
import { pedir, verificarResposta } from "./requisicao";

const TAMANHO_DA_PAGINA = 100;
const LIMITE_DE_PAGINAS = 5;
const QUANTIDADE_DE_RECENTES = 5;

const NIVEIS: NivelRecomendacao[] = [
  "ideal",
  "recommended",
  "acceptable",
  "not_recommended",
  "contraindicated",
];

interface Paginas {
  itens: unknown[];
  truncated: boolean;
}

interface AnaliseLida {
  id: number;
  productVersionId: number;
  healthScore: number | null;
  environmentalScore: number | null;
  ethicalScore: number | null;
  createdAt: string;
}

interface NotaPessoalLida {
  productVersionId: number;
  finalScore: number;
  recommendationLevel: NivelRecomendacao | null;
  createdAt: string;
}

async function lerPaginas(
  caminhoBase: string,
  sinal?: AbortSignal,
): Promise<Paginas> {
  const itens: unknown[] = [];

  for (let pagina = 0; pagina < LIMITE_DE_PAGINAS; pagina += 1) {
    const caminho = `${caminhoBase}?page=${pagina}&size=${TAMANHO_DA_PAGINA}&sort=createdAt,desc`;
    const resposta = await pedir(`${URL_API}${caminho}`, { signal: sinal });

    verificarResposta(resposta, caminho);

    const dados = comoObjeto(await resposta.json());
    const daPagina = Array.isArray(dados.content) ? dados.content : [];

    itens.push(...daPagina);

    if (dados.last === true || daPagina.length < TAMANHO_DA_PAGINA) {
      return { itens, truncated: false };
    }
  }

  return { itens, truncated: true };
}

function lerNivel(valor: unknown): NivelRecomendacao | null {
  const minusculo = typeof valor === "string" ? valor.toLowerCase() : "";

  return NIVEIS.find((nivel) => nivel === minusculo) ?? null;
}

function lerAnalise(valor: unknown): AnaliseLida | null {
  const dados = comoObjeto(valor);
  const id = numero(dados.id);
  const productVersionId = numero(dados.productVersionId);
  const createdAt = texto(dados.createdAt);

  if (id === null || productVersionId === null || createdAt === null) {
    return null;
  }

  return {
    id,
    productVersionId,
    healthScore: numero(dados.healthScore),
    environmentalScore: numero(dados.environmentalScore),
    ethicalScore: numero(dados.ethicalScore),
    createdAt,
  };
}

function lerNotaPessoal(valor: unknown): NotaPessoalLida | null {
  const dados = comoObjeto(valor);
  const productVersionId = numero(dados.productVersionId);
  const finalScore = numero(dados.finalScore);
  const createdAt = texto(dados.createdAt);

  if (productVersionId === null || finalScore === null || createdAt === null) {
    return null;
  }

  return {
    productVersionId,
    finalScore,
    recommendationLevel: lerNivel(dados.recommendationLevel),
    createdAt,
  };
}

function lerTodos<T>(itens: unknown[], ler: (valor: unknown) => T | null): T[] {
  return itens.flatMap((item) => {
    const lido = ler(item);

    return lido === null ? [] : [lido];
  });
}

function maisRecentePorVersao<T extends { productVersionId: number }>(
  itens: T[],
): T[] {
  const vistas = new Set<number>();

  return itens.filter((item) => {
    if (vistas.has(item.productVersionId)) {
      return false;
    }

    vistas.add(item.productVersionId);

    return true;
  });
}

function ehDesteMes(data: string): boolean {
  const lida = new Date(data);
  const hoje = new Date();

  return (
    lida.getFullYear() === hoje.getFullYear() &&
    lida.getMonth() === hoje.getMonth()
  );
}

function contarPorPeriodo(
  datas: string[],
  truncated: boolean,
): ContagemPorPeriodo {
  return {
    total: datas.length,
    thisMonth: datas.filter(ehDesteMes).length,
    truncated,
  };
}

function media(valores: (number | null)[]): number | null {
  const presentes = valores.filter((valor): valor is number => valor !== null);

  if (presentes.length === 0) {
    return null;
  }

  const soma = presentes.reduce((total, valor) => total + valor, 0);

  return Math.round(soma / presentes.length);
}

function contarNiveis(
  notas: NotaPessoalLida[],
  niveis: NivelRecomendacao[],
): number {
  return notas.filter(
    (nota) =>
      nota.recommendationLevel !== null &&
      niveis.includes(nota.recommendationLevel),
  ).length;
}

function resumir(
  notas: NotaPessoalLida[],
  analises: AnaliseLida[],
): ResumoDasAnalises {
  const ultimasAnalises = maisRecentePorVersao(analises);

  return {
    productCount: notas.length,
    averageScore: media(notas.map((nota) => nota.finalScore)),
    healthScore: media(ultimasAnalises.map((analise) => analise.healthScore)),
    environmentalScore: media(
      ultimasAnalises.map((analise) => analise.environmentalScore),
    ),
    ethicalScore: media(ultimasAnalises.map((analise) => analise.ethicalScore)),
    approved: contarNiveis(notas, ["ideal", "recommended"]),
    warning: contarNiveis(notas, ["acceptable"]),
    replace: contarNiveis(notas, ["not_recommended", "contraindicated"]),
  };
}

async function buscarProdutoDaVersao(
  versaoId: number,
  sinal?: AbortSignal,
): Promise<ProdutoDoPainel | null> {
  const caminho = `/api/product-versions/${versaoId}`;
  const resposta = await pedir(`${URL_API}${caminho}`, { signal: sinal });

  if (resposta.status === 404) {
    return null;
  }

  verificarResposta(resposta, caminho);

  const produtoId = numero(comoObjeto(await resposta.json()).productId);

  if (produtoId === null) {
    return null;
  }

  const produto = await buscarProdutoPorIdDaApi(produtoId, sinal);

  if (produto === null) {
    return null;
  }

  return {
    slug: produto.slug,
    name: produto.name,
    brandName: produto.brand.name,
    imageUrl: produto.imageUrl,
  };
}

async function montarRecentes(
  analises: AnaliseLida[],
  notas: NotaPessoalLida[],
  sinal?: AbortSignal,
): Promise<AnaliseRecente[]> {
  const recentes = analises.slice(0, QUANTIDADE_DE_RECENTES);
  const versoes = [
    ...new Set(recentes.map((analise) => analise.productVersionId)),
  ];

  const produtos = new Map<number, ProdutoDoPainel | null>();

  await Promise.all(
    versoes.map(async (versaoId) => {
      produtos.set(versaoId, await buscarProdutoDaVersao(versaoId, sinal));
    }),
  );

  return recentes.flatMap((analise): AnaliseRecente[] => {
    const produto = produtos.get(analise.productVersionId) ?? null;
    const nota = notas.find(
      (item) => item.productVersionId === analise.productVersionId,
    );

    if (produto === null) {
      return [];
    }

    return [
      {
        id: String(analise.id),
        product: produto,
        finalScore: nota === undefined ? null : nota.finalScore,
        recommendationLevel:
          nota === undefined ? null : nota.recommendationLevel,
        analyzedAt: analise.createdAt,
      },
    ];
  });
}

async function contarFavoritos(
  usuarioId: number,
  sinal?: AbortSignal,
): Promise<number> {
  const caminho = `/api/favorites/user/${usuarioId}/count`;
  const resposta = await pedir(`${URL_API}${caminho}`, { signal: sinal });

  verificarResposta(resposta, caminho);

  return numero(await resposta.json()) ?? 0;
}

export async function buscarPainelNaApi(
  usuarioId: number,
  sinal?: AbortSignal,
): Promise<Omit<Painel, "profileCompleteness">> {
  const [paginasDeAnalises, paginasDeNotas, favoriteCount] = await Promise.all([
    lerPaginas(`/api/analysis-results/user/${usuarioId}`, sinal),
    lerPaginas(`/api/personalized-scores/user/${usuarioId}`, sinal),
    contarFavoritos(usuarioId, sinal),
  ]);

  const analises = lerTodos(paginasDeAnalises.itens, lerAnalise);
  const notas = maisRecentePorVersao(
    lerTodos(paginasDeNotas.itens, lerNotaPessoal),
  );
  const alertas = notas.filter(
    (nota) => nota.recommendationLevel === "contraindicated",
  );
  const maisAntiga =
    analises.length === 0 ? undefined : analises[analises.length - 1];

  return {
    analyses: contarPorPeriodo(
      analises.map((analise) => analise.createdAt),
      paginasDeAnalises.truncated,
    ),
    alerts: contarPorPeriodo(
      alertas.map((nota) => nota.createdAt),
      paginasDeNotas.truncated,
    ),
    firstAnalysisAt:
      paginasDeAnalises.truncated || maisAntiga === undefined
        ? null
        : maisAntiga.createdAt,
    favoriteCount,
    summary: resumir(notas, analises),
    recentAnalyses: await montarRecentes(analises, notas, sinal),
    recommendedSwap: null,
  };
}
