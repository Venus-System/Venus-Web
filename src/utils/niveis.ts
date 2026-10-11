import type { NivelRecomendacao } from "../types/analise";
import type { RiskLevel } from "../types/ingrediente";

const FAIXAS: { minimo: number; faixa: NivelRecomendacao }[] = [
  { minimo: 85, faixa: "ideal" },
  { minimo: 70, faixa: "recommended" },
  { minimo: 50, faixa: "acceptable" },
  { minimo: 25, faixa: "not_recommended" },
  { minimo: 0, faixa: "contraindicated" },
];

export const ROTULO_DA_FAIXA: Record<NivelRecomendacao, string> = {
  ideal: "Ideal",
  recommended: "Recomendado",
  acceptable: "Aceitável",
  not_recommended: "Não recomendado",
  contraindicated: "Contraindicado",
};

export function faixaDaNota(nota: number | null): NivelRecomendacao | null {
  if (nota === null) {
    return null;
  }

  return (
    FAIXAS.find((item) => nota >= item.minimo)?.faixa ?? "contraindicated"
  );
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

export function nivelDaNota(nota: number | null): RiskLevel {
  return nivelDaRecomendacao(faixaDaNota(nota));
}
