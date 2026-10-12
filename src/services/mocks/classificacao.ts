import type {
  AnalisePersonalizada,
  MotivoDaAnalise,
  OrigemDoMotivo,
} from "../../types/analise";
import {
  gelLimpezaPurificante,
  hidratanteCeramidas,
  locaoClareadoraNoturna,
  oleoCapilarReparador,
  serumCalmanteAveia,
} from "./produtos";

const CALCULADA_EM = "2026-10-10T14:03:22Z";

function motivo(
  source: OrigemDoMotivo,
  text: string,
  warning = false,
  ingredientName: string | null = null,
  profileTagSlug: string | null = null,
): MotivoDaAnalise {
  return {
    id: [source, ingredientName ?? "", profileTagSlug ?? "", text].join("|"),
    source,
    text,
    warning,
    ingredientName,
    profileTagSlug,
  };
}

export const analisesPessoaisMock: Record<string, AnalisePersonalizada> = {
  [serumCalmanteAveia.slug]: {
    finalScore: 86,
    recommendationLevel: "ideal",
    riskLevel: "low",
    compatibilityPercentage: 85,
    summary:
      "Nota 86 de 100 - Ideal. A aveia acalma pele sensível e a marca é vegana, como você prefere.",
    reasons: [
      motivo(
        "ingredient_rule",
        "Aveia coloidal acalma pele sensível.",
        false,
        "Avena Sativa Kernel Extract",
        "reativa",
      ),
      motivo(
        "ingredient_rule",
        "Niacinamida ajuda a controlar a oleosidade.",
        false,
        "Niacinamide",
        "controle-de-oleosidade",
      ),
      motivo("preference", "A marca declara ser vegana, como você prefere."),
      motivo("base_score", "Qualidade do produto: 88 de 100."),
    ],
    breakdown: {
      qualityScore: 88,
      qualityPoints: 30.8,
      profilePoints: 55.3,
      healthScore: 92,
      environmentalScore: 84,
      ethicalScore: 90,
      performanceScore: 82,
    },
    ingredientCount: 6,
    unevaluatedIngredientCount: 0,
    calculatedAt: CALCULADA_EM,
    complete: true,
  },

  [hidratanteCeramidas.slug]: {
    finalScore: 75,
    recommendationLevel: "recommended",
    riskLevel: "low",
    compatibilityPercentage: 72,
    summary:
      "Nota 75 de 100 - Recomendado. As ceramidas reforçam a barreira da pele seca.",
    reasons: [
      motivo(
        "ingredient_rule",
        "Ceramidas reforçam a barreira da pele seca.",
        false,
        "Ceramide NP",
        "muito-seca",
      ),
      motivo(
        "ingredient_rule",
        "Glicerina é de origem natural.",
        false,
        "Glycerin",
        "ingredientes-naturais",
      ),
      motivo("base_score", "Qualidade do produto: 81 de 100."),
    ],
    breakdown: {
      qualityScore: 81,
      qualityPoints: 28.4,
      profilePoints: 46.8,
      healthScore: 87,
      environmentalScore: 72,
      ethicalScore: null,
      performanceScore: 85,
    },
    ingredientCount: 6,
    unevaluatedIngredientCount: 0,
    calculatedAt: CALCULADA_EM,
    complete: true,
  },

  [gelLimpezaPurificante.slug]: {
    finalScore: 38,
    recommendationLevel: "not_recommended",
    riskLevel: "medium",
    compatibilityPercentage: 50,
    summary:
      "Nota 38 de 100 - Não recomendado. Atenção: a fórmula tem um sulfato, e você declarou alergia leve a sulfatos.",
    reasons: [
      motivo(
        "allergy",
        "Contém Sodium Lauryl Sulfate, ligado à sua alergia a sulfatos (leve). A nota perdeu 15 pontos.",
        true,
        "Sodium Lauryl Sulfate",
      ),
      motivo(
        "ingredient_rule",
        "Fragrância pode irritar pele sensível.",
        true,
        "Parfum",
        "reativa",
      ),
      motivo(
        "ingredient_rule",
        "Glicerina é de origem natural.",
        false,
        "Glycerin",
        "ingredientes-naturais",
      ),
      motivo("base_score", "Qualidade do produto: 58 de 100."),
    ],
    breakdown: {
      qualityScore: 58,
      qualityPoints: 20.3,
      profilePoints: 32.5,
      healthScore: 54,
      environmentalScore: 49,
      ethicalScore: 45,
      performanceScore: 76,
    },
    ingredientCount: 5,
    unevaluatedIngredientCount: 0,
    calculatedAt: CALCULADA_EM,
    complete: true,
  },

  [locaoClareadoraNoturna.slug]: {
    finalScore: 0,
    recommendationLevel: "contraindicated",
    riskLevel: "critical",
    compatibilityPercentage: 20,
    summary:
      "Nota 0 de 100 - Contraindicado. A fórmula tem retinol, que é contraindicado na gestação.",
    reasons: [
      motivo(
        "ingredient_rule",
        "Retinol é contraindicado na gestação.",
        true,
        "Retinol",
        "gravidez",
      ),
      motivo(
        "ingredient_rule",
        "Álcool desnaturado resseca pele sensível.",
        true,
        "Alcohol Denat.",
        "reativa",
      ),
      motivo("base_score", "Qualidade do produto: 31 de 100."),
    ],
    breakdown: {
      qualityScore: 31,
      qualityPoints: 10.9,
      profilePoints: 13,
      healthScore: 22,
      environmentalScore: 61,
      ethicalScore: 78,
      performanceScore: 70,
    },
    ingredientCount: 5,
    unevaluatedIngredientCount: 0,
    calculatedAt: CALCULADA_EM,
    complete: true,
  },

  [oleoCapilarReparador.slug]: {
    finalScore: 40,
    recommendationLevel: "not_recommended",
    riskLevel: "medium",
    compatibilityPercentage: null,
    summary: "Nota 40 de 100 - Não recomendado.",
    reasons: [
      motivo("base_score", "Qualidade do produto: 40 de 100."),
      motivo(
        "base_score",
        "1 de 3 ingredientes ainda sem avaliação de saúde e ambiental.",
      ),
    ],
    breakdown: {
      qualityScore: 40,
      qualityPoints: 14,
      profilePoints: null,
      healthScore: null,
      environmentalScore: null,
      ethicalScore: 50,
      performanceScore: 33,
    },
    ingredientCount: 3,
    unevaluatedIngredientCount: 1,
    calculatedAt: CALCULADA_EM,
    complete: true,
  },
};
