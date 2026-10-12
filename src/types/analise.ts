import type { IngredienteAvaliado } from "./ingrediente";
import type { Produto } from "./produto";

export type PersonalRiskLevel = "low" | "medium" | "high" | "critical";

export type NivelRecomendacao =
  | "ideal"
  | "recommended"
  | "acceptable"
  | "not_recommended"
  | "contraindicated";

export type OrigemDoMotivo =
  | "ingredient_rule"
  | "allergy"
  | "preference"
  | "base_score"
  | "other";

export interface MotivoDaAnalise {
  id: string;
  source: OrigemDoMotivo;
  text: string;
  warning: boolean;
  ingredientName: string | null;
  profileTagSlug: string | null;
}

export interface NotasDaAnalise {
  qualityScore: number | null;
  qualityPoints: number | null;
  profilePoints: number | null;
  healthScore: number | null;
  environmentalScore: number | null;
  ethicalScore: number | null;
  performanceScore: number | null;
}

export interface AnalisePersonalizada {
  finalScore: number;
  recommendationLevel: NivelRecomendacao;
  riskLevel: PersonalRiskLevel;
  compatibilityPercentage: number | null;
  summary: string;
  reasons: MotivoDaAnalise[];
  breakdown: NotasDaAnalise;
  ingredientCount: number | null;
  unevaluatedIngredientCount: number | null;
  calculatedAt: string;
  complete: boolean;
}

export type AnalisePessoal =
  | { situacao: "pronta"; analise: AnalisePersonalizada }
  | { situacao: "sem-perfil" }
  | { situacao: "indisponivel"; mensagem: string };

export interface AnaliseExibicao {
  product: Produto;
  versionId: number | null;
  ingredients: IngredienteAvaliado[];
}
