import type { IngredienteAvaliado } from "./ingrediente";
import type { Produto } from "./produto";

export type PersonalRiskLevel = "low" | "medium" | "high" | "critical";

export type NivelRecomendacao =
  | "ideal"
  | "recommended"
  | "acceptable"
  | "not_recommended"
  | "contraindicated";

export interface AlertaPersonalizado {
  inciName: string;
  explanation: string;
  finalDelta: number;
}

export interface AnalisePersonalizada {
  finalScore: number;
  compatibilityPercentage: number;
  riskLevel: PersonalRiskLevel;
  recommendationLevel: NivelRecomendacao;
  summary: string;
  alerts: AlertaPersonalizado[];
}

export interface AnaliseExibicao {
  product: Produto;
  ingredients: IngredienteAvaliado[];
  personalized: AnalisePersonalizada | null;
}
