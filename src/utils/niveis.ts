import type { NivelRecomendacao } from "../types/analise";
import type { RiskLevel } from "../types/ingrediente";

export function nivelDaNota(nota: number | null): RiskLevel {
  if (nota === null) {
    return "no-data";
  }

  if (nota >= 70) {
    return "safe";
  }

  if (nota >= 50) {
    return "warning";
  }

  return "avoid";
}

export function nivelDaRecomendacao(
  recomendacao: NivelRecomendacao | null,
): RiskLevel {
  if (recomendacao === null) {
    return "no-data";
  }

  if (recomendacao === "ideal" || recomendacao === "recommended") {
    return "safe";
  }

  if (recomendacao === "acceptable") {
    return "warning";
  }

  return "avoid";
}
