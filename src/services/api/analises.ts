import { URL_API } from "../../config/ambiente";
import type { NivelRecomendacao } from "../../types/analise";
import type { AnaliseRecente, ProdutoDoPainel } from "../../types/painel";
import { comoObjeto, numero, texto } from "./leitura";
import { buscarProdutoPorIdDaApi } from "./produtos";
import { pedir, verificarResposta } from "./requisicao";

const TAMANHO_DA_PAGINA = 100;
const LIMITE_DE_PAGINAS = 5;

const NIVEIS: NivelRecomendacao[] = [
  "ideal",
  "recommended",
  "acceptable",
  "not_recommended",
  "contraindicated",
];

export interface Paginas {
  itens: unknown[];
  truncated: boolean;
}

export interface AnaliseLida {
  id: number;
  productVersionId: number;
  healthScore: number | null;
  environmentalScore: number | null;
  ethicalScore: number | null;
  createdAt: string;
}

export interface NotaPessoalLida {
  productVersionId: number;
  finalScore: number;
  recommendationLevel: NivelRecomendacao | null;
  createdAt: string;
}

export async function lerPaginas(
  caminhoBase: string,
  sinal?: AbortSignal,
  urlBase: string = URL_API,
): Promise<Paginas> {
  const itens: unknown[] = [];

  for (let pagina = 0; pagina < LIMITE_DE_PAGINAS; pagina += 1) {
    const caminho = `${caminhoBase}?page=${pagina}&size=${TAMANHO_DA_PAGINA}&sort=createdAt,desc`;
    const resposta = await pedir(`${urlBase}${caminho}`, { signal: sinal });

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

export function lerAnalise(valor: unknown): AnaliseLida | null {
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

export function lerNotaPessoal(valor: unknown): NotaPessoalLida | null {
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

export function maisRecentePorVersao<T extends { productVersionId: number }>(
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

export async function montarAnalises(
  analises: AnaliseLida[],
  notas: NotaPessoalLida[],
  sinal?: AbortSignal,
): Promise<AnaliseRecente[]> {
  const versoes = [
    ...new Set(analises.map((analise) => analise.productVersionId)),
  ];

  const produtos = new Map<number, ProdutoDoPainel | null>();

  await Promise.all(
    versoes.map(async (versaoId) => {
      produtos.set(versaoId, await buscarProdutoDaVersao(versaoId, sinal));
    }),
  );

  return analises.flatMap((analise): AnaliseRecente[] => {
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
