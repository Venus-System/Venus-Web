export type RiskLevel = "safe" | "warning" | "avoid" | "no-data";

export interface Ingrediente {
  inciName: string;
  commonName: string;
  functionSummary: string;
  safetySummary: string;
  biodegradability: number;
  irritationRiskLevel: number;
  comedogenicityScore: number;
  environmentalRiskLevel: number;
  scientificConfidence: number;
}

export interface IngredienteAvaliado {
  inciName: string;
  position: number;
  level: RiskLevel;
  ingredient: Ingrediente | null;
}
