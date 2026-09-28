import type { NivelRecomendacao } from "./analise";

export interface ContagemPorPeriodo {
  total: number;
  thisMonth: number;
  truncated: boolean;
}

export interface ProdutoDoPainel {
  slug: string;
  name: string;
  brandName: string;
  imageUrl: string | null;
}

export interface ResumoDasAnalises {
  productCount: number;
  averageScore: number | null;
  healthScore: number | null;
  environmentalScore: number | null;
  ethicalScore: number | null;
  approved: number;
  warning: number;
  replace: number;
}

export interface AnaliseRecente {
  id: string;
  product: ProdutoDoPainel;
  finalScore: number | null;
  recommendationLevel: NivelRecomendacao | null;
  analyzedAt: string;
}

export interface LadoDaTroca {
  product: ProdutoDoPainel;
  finalScore: number | null;
  note: string;
}

export interface TrocaRecomendada {
  current: LadoDaTroca;
  suggested: LadoDaTroca;
}

export interface Painel {
  analyses: ContagemPorPeriodo;
  alerts: ContagemPorPeriodo;
  firstAnalysisAt: string | null;
  favoriteCount: number;
  summary: ResumoDasAnalises;
  recentAnalyses: AnaliseRecente[];
  recommendedSwap: TrocaRecomendada | null;
  profileCompleteness: number | null;
}
