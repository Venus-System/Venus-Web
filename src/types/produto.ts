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
  overallScore: number;
  healthScore: number;
  environmentalScore: number;
  ethicalScore: number;
  performanceScore: number;
  transparencyScore: number;
  confidenceScore: number;
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
