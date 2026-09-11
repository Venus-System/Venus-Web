import type { NotasProduto, Produto } from "../../types/produto";
import type { RiskLevel } from "../../types/ingrediente";
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

function paraNivel(overallScore: number | null): RiskLevel {
  if (overallScore === null) {
    return "no-data";
  }

  if (overallScore >= 70) {
    return "safe";
  }

  return overallScore >= 40 ? "warning" : "avoid";
}

export function paraProduto(resposta: ProductFullResponse): Produto {
  const notas = paraNotas(resposta.score);

  return {
    slug: resposta.product.slug,
    name: resposta.product.name,
    description: resposta.product.description ?? "",
    category: resposta.category.name,
    brand: resposta.brand,
    imageUrl: null,
    level: paraNivel(notas.overallScore),
    scores: notas,
  };
}

export function paraProdutoDaListagem(
  item: ProdutoApi,
  marca: MarcaApi,
  categoria: CategoriaApi,
): Produto {
  return {
    slug: item.slug,
    name: item.name,
    description: item.description ?? "",
    category: categoria.name,
    brand: marca,
    imageUrl: null,
    level: "no-data",
    scores: NOTAS_VAZIAS,
  };
}
