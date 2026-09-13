import type { RiskLevel } from "./ingrediente";

export interface Marca {
  name: string;
  country: string | null;
  website: string | null;
  hasCrueltyFreeClaim: boolean;
  hasVeganClaim: boolean;
  isBrazilian: boolean;
}

export interface NotasProduto {
  overallScore: number | null;
  healthScore: number | null;
  environmentalScore: number | null;
  ethicalScore: number | null;
  performanceScore: number | null;
  transparencyScore: number | null;
  confidenceScore: number | null;
}

export interface Produto {
  slug: string;
  name: string;
  description: string;
  category: string;
  brand: Marca;
  imageUrl: string | null;
  level: RiskLevel;
  scores: NotasProduto;
}
