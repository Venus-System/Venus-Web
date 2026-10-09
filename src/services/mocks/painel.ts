import type { Produto } from "../../types/produto";
import type { Painel, ProdutoDoPainel } from "../../types/painel";
import {
  gelLimpezaPurificante,
  hidratanteCeramidas,
  locaoClareadoraNoturna,
  oleoCapilarReparador,
  serumCalmanteAveia,
} from "./produtos";

const UMA_HORA = 60 * 60 * 1000;

export function horasAtras(horas: number): string {
  return new Date(Date.now() - horas * UMA_HORA).toISOString();
}

export function doPainel(produto: Produto): ProdutoDoPainel {
  return {
    slug: produto.slug,
    name: produto.name,
    brandName: produto.brand.name,
    imageUrl: produto.imageUrl,
  };
}

export function painelDoMock(): Omit<Painel, "profileCompleteness"> {
  return {
    analyses: { total: 47, thisMonth: 12, truncated: false },
    alerts: { total: 3, thisMonth: 1, truncated: false },
    firstAnalysisAt: "2026-03-14T10:00:00.000Z",
    favoriteCount: 3,
    summary: {
      productCount: 12,
      averageScore: 84,
      healthScore: 88,
      environmentalScore: 76,
      ethicalScore: 89,
      approved: 9,
      warning: 2,
      replace: 1,
    },
    recentAnalyses: [
      {
        id: "analise-serum",
        product: doPainel(serumCalmanteAveia),
        finalScore: 87,
        recommendationLevel: "ideal",
        analyzedAt: horasAtras(2),
      },
      {
        id: "analise-gel",
        product: doPainel(gelLimpezaPurificante),
        finalScore: 54,
        recommendationLevel: "acceptable",
        analyzedAt: horasAtras(26),
      },
      {
        id: "analise-hidratante",
        product: doPainel(hidratanteCeramidas),
        finalScore: 78,
        recommendationLevel: "recommended",
        analyzedAt: horasAtras(74),
      },
      {
        id: "analise-locao",
        product: doPainel(locaoClareadoraNoturna),
        finalScore: 12,
        recommendationLevel: "contraindicated",
        analyzedAt: horasAtras(122),
      },
      {
        id: "analise-oleo",
        product: doPainel(oleoCapilarReparador),
        finalScore: null,
        recommendationLevel: null,
        analyzedAt: horasAtras(146),
      },
    ],
    recommendedSwap: {
      current: {
        product: doPainel(locaoClareadoraNoturna),
        finalScore: 12,
        note: "Contém retinol e fragrância adicionada",
      },
      suggested: {
        product: doPainel(serumCalmanteAveia),
        finalScore: 87,
        note: "Sem fragrância adicionada, com niacinamida",
      },
    },
  };
}
