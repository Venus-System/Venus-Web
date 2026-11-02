import type { Ingrediente, RiskLevel } from "../types/ingrediente";

const RISCO_PARA_ATENCAO = 4;
const RISCO_PARA_EVITAR = 7;

export function nivelDoIngrediente(ingrediente: Ingrediente): RiskLevel {
  if (ingrediente.scientificConfidence === 0) {
    return "no-data";
  }

  const riscoParaAPele = Math.max(
    ingrediente.irritationRiskLevel,
    ingrediente.comedogenicityScore,
  );

  if (riscoParaAPele >= RISCO_PARA_EVITAR) {
    return "avoid";
  }

  return riscoParaAPele >= RISCO_PARA_ATENCAO ? "warning" : "safe";
}
