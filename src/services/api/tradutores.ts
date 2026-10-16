import type { Marca, NotasProduto, Produto } from "../../types/produto";
import { nivelDaNota } from "../../utils/niveis";
import { comoObjeto, lerTodos, numero, texto } from "./leitura";
import type {
  CategoriaApi,
  MarcaApi,
  NotasApi,
  ProdutoApi,
  ProductFullResponse,
} from "./tipos";

const NOTAS_VAZIAS: NotasProduto = {
  overallScore: null,
  healthScore: null,
  environmentalScore: null,
  ethicalScore: null,
  performanceScore: null,
  transparencyScore: null,
  confidenceScore: null,
};

function paraNotas(score: NotasApi | null): NotasProduto {
  if (score === null || score.confidenceScore === 0) {
    return NOTAS_VAZIAS;
  }

  return {
    overallScore: score.overallScore,
    healthScore: score.healthScore,
    environmentalScore: score.environmentalScore,
    ethicalScore: score.ethicalScore,
    performanceScore: score.performanceScore,
    transparencyScore: score.transparencyScore,
    confidenceScore: score.confidenceScore,
  };
}

function paraMarca(marca: MarcaApi): Marca {
  return {
    name: marca.name,
    country: marca.country ?? null,
    website: marca.website ?? null,
    hasCrueltyFreeClaim: marca.hasCrueltyFreeClaim === true,
    hasVeganClaim: marca.hasVeganClaim === true,
    isBrazilian: marca.isBrazilian === true,
  };
}

interface FotoLida {
  url: string;
  ordem: number;
}

function lerFoto(valor: unknown): FotoLida | null {
  const dados = comoObjeto(valor);
  const url = texto(dados.url);

  if (
    dados.purpose !== "PRODUCT_PHOTO" ||
    dados.status !== "ACTIVE" ||
    url === null
  ) {
    return null;
  }

  return { url, ordem: numero(dados.sortOrder) ?? Number.MAX_SAFE_INTEGER };
}

function fotoDoProduto(fotos: unknown): string | null {
  if (!Array.isArray(fotos)) {
    return null;
  }

  const validas = lerTodos(fotos, lerFoto).sort((a, b) => a.ordem - b.ordem);

  return validas.length === 0 ? null : validas[0].url;
}

export function paraProduto(resposta: ProductFullResponse): Produto {
  const notas = paraNotas(resposta.score);

  return {
    slug: resposta.product.slug,
    name: resposta.product.name,
    description: resposta.product.description ?? "",
    category: resposta.category.name,
    brand: paraMarca(resposta.brand),
    imageUrl: fotoDoProduto(resposta.photos),
    level: nivelDaNota(notas.overallScore),
    scores: notas,
  };
}

export function paraProdutoDaListagem(
  item: ProdutoApi,
  marca: MarcaApi,
  categoria: CategoriaApi,
  score: NotasApi | null,
): Produto {
  const notas = paraNotas(score);

  return {
    slug: item.slug,
    name: item.name,
    description: item.description ?? "",
    category: categoria.name,
    brand: paraMarca(marca),
    imageUrl: null,
    level: nivelDaNota(notas.overallScore),
    scores: notas,
  };
}
