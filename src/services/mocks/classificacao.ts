import type {
  AnalisePersonalizada,
  MotivoDaAnalise,
  OrigemDoMotivo,
} from "../../types/analise";
import {
  cremeHidratantePerfumado,
  gelLimpezaPurificante,
  gelLimpezaSuave,
  hidratanteCeramidas,
  locaoClareadoraNoturna,
  mascaraCalmantePantenol,
  mascaraCapilarNutritiva,
  oleoCapilarReparador,
  serumCalmanteAveia,
  serumUniformizador,
} from "./produtos";

const CALCULADA_EM = "2026-10-10T14:03:22Z";

interface DadosDoMotivo {
  source: OrigemDoMotivo;
  text: string;
  warning?: boolean;
  blocking?: boolean;
  ingredientName?: string;
  allergenNames?: string[];
  profileTagSlug?: string;
}

function motivo({
  source,
  text,
  warning = false,
  blocking = false,
  ingredientName,
  allergenNames = [],
  profileTagSlug,
}: DadosDoMotivo): MotivoDaAnalise {
  return {
    id: [source, ingredientName ?? "", profileTagSlug ?? "", text].join("|"),
    source,
    text,
    warning,
    blocking,
    bonus: source === "ingredient_rule" && !warning,
    ingredientName: ingredientName ?? null,
    ingredientNames:
      ingredientName === undefined ? allergenNames : [ingredientName],
    profileTagSlug: profileTagSlug ?? null,
  };
}

export const analisesPessoaisMock: Record<string, AnalisePersonalizada> = {
  [serumCalmanteAveia.slug]: {
    finalScore: 86,
    recommendationLevel: "ideal",
    riskLevel: "low",
    compatibilityPercentage: 85,
    summary:
      "Nota 86 de 100 - Ideal. A marca declara ser vegana, como você prefere. Aveia coloidal acalma pele sensível.",
    reasons: [
      motivo({
        source: "preference",
        text: "A marca declara ser vegana, como você prefere.",
      }),
      motivo({
        source: "ingredient_rule",
        text: "Aveia coloidal acalma pele sensível.",
        ingredientName: "Extrato de aveia",
        profileTagSlug: "reativa",
      }),
      motivo({
        source: "ingredient_rule",
        text: "Niacinamida ajuda a controlar a oleosidade.",
        ingredientName: "Niacinamida",
        profileTagSlug: "controle-de-oleosidade",
      }),
      motivo({
        source: "base_score",
        text: "Qualidade do produto: 88 de 100.",
      }),
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
      "Nota 75 de 100 - Recomendado. Ceramidas reforçam a barreira da pele seca. Glicerina é de origem natural.",
    reasons: [
      motivo({
        source: "ingredient_rule",
        text: "Ceramidas reforçam a barreira da pele seca.",
        ingredientName: "Ceramida NP",
        profileTagSlug: "muito-seca",
      }),
      motivo({
        source: "ingredient_rule",
        text: "Glicerina é de origem natural.",
        ingredientName: "Glicerina",
        profileTagSlug: "ingredientes-naturais",
      }),
      motivo({
        source: "base_score",
        text: "Qualidade do produto: 81 de 100.",
      }),
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
      "Nota 38 de 100 - Não recomendado. Atenção: Contém Lauril sulfato de sódio, ligado à sua alergia a Sulfatos (gravidade leve). Atenção: Fragrância pode irritar pele sensível.",
    reasons: [
      motivo({
        source: "allergy",
        text: "Contém Lauril sulfato de sódio, ligado à sua alergia a Sulfatos (gravidade leve).",
        warning: true,
        allergenNames: ["Lauril sulfato de sódio"],
      }),
      motivo({
        source: "ingredient_rule",
        text: "Fragrância pode irritar pele sensível.",
        warning: true,
        ingredientName: "Fragrância",
        profileTagSlug: "reativa",
      }),
      motivo({
        source: "ingredient_rule",
        text: "Glicerina é de origem natural.",
        ingredientName: "Glicerina",
        profileTagSlug: "ingredientes-naturais",
      }),
      motivo({
        source: "preference",
        text: "A marca não declara ser vegana, e você prefere produtos veganos.",
      }),
      motivo({
        source: "base_score",
        text: "Qualidade do produto: 58 de 100.",
      }),
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
      "Nota 0 de 100 - Contraindicado. Atenção: Retinol é contraindicado na gestação. Atenção: Álcool desnaturado resseca pele sensível.",
    reasons: [
      motivo({
        source: "ingredient_rule",
        text: "Retinol é contraindicado na gestação.",
        warning: true,
        blocking: true,
        ingredientName: "Retinol",
        profileTagSlug: "gravidez",
      }),
      motivo({
        source: "ingredient_rule",
        text: "Álcool desnaturado resseca pele sensível.",
        warning: true,
        ingredientName: "Álcool desnaturado",
        profileTagSlug: "reativa",
      }),
      motivo({
        source: "base_score",
        text: "Qualidade do produto: 31 de 100.",
      }),
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
      motivo({
        source: "base_score",
        text: "Qualidade do produto: 40 de 100.",
      }),
      motivo({
        source: "base_score",
        text: "1 de 3 ingredientes ainda sem avaliação de saúde e ambiental.",
      }),
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

  [serumUniformizador.slug]: {
    finalScore: 54,
    recommendationLevel: "acceptable",
    riskLevel: "medium",
    compatibilityPercentage: 55,
    summary:
      "Nota 54 de 100 - Aceitável. Atenção: Fragrância pode irritar pele sensível. Niacinamida ajuda a controlar a oleosidade.",
    reasons: [
      motivo({
        source: "ingredient_rule",
        text: "Fragrância pode irritar pele sensível.",
        warning: true,
        ingredientName: "Fragrância",
        profileTagSlug: "reativa",
      }),
      motivo({
        source: "ingredient_rule",
        text: "Niacinamida ajuda a controlar a oleosidade.",
        ingredientName: "Niacinamida",
        profileTagSlug: "controle-de-oleosidade",
      }),
      motivo({
        source: "preference",
        text: "A marca declara ser vegana, como você prefere.",
      }),
      motivo({
        source: "base_score",
        text: "Qualidade do produto: 66 de 100.",
      }),
    ],
    breakdown: {
      qualityScore: 66,
      qualityPoints: 23.1,
      profilePoints: 30.9,
      healthScore: 62,
      environmentalScore: 70,
      ethicalScore: 82,
      performanceScore: 80,
    },
    ingredientCount: 6,
    unevaluatedIngredientCount: 0,
    calculatedAt: CALCULADA_EM,
    complete: true,
  },

  [cremeHidratantePerfumado.slug]: {
    finalScore: 41,
    recommendationLevel: "not_recommended",
    riskLevel: "medium",
    compatibilityPercentage: 40,
    summary:
      "Nota 41 de 100 - Não recomendado. Atenção: Fragrância pode irritar pele sensível.",
    reasons: [
      motivo({
        source: "ingredient_rule",
        text: "Fragrância pode irritar pele sensível.",
        warning: true,
        ingredientName: "Fragrância",
        profileTagSlug: "reativa",
      }),
      motivo({
        source: "preference",
        text: "A marca não declara ser vegana, e você prefere produtos veganos.",
      }),
      motivo({
        source: "base_score",
        text: "Qualidade do produto: 55 de 100.",
      }),
    ],
    breakdown: {
      qualityScore: 55,
      qualityPoints: 19.3,
      profilePoints: 21.7,
      healthScore: 50,
      environmentalScore: 52,
      ethicalScore: 40,
      performanceScore: 72,
    },
    ingredientCount: 5,
    unevaluatedIngredientCount: 0,
    calculatedAt: CALCULADA_EM,
    complete: true,
  },

  [gelLimpezaSuave.slug]: {
    finalScore: 80,
    recommendationLevel: "recommended",
    riskLevel: "low",
    compatibilityPercentage: 78,
    summary:
      "Nota 80 de 100 - Recomendado. Aveia coloidal acalma pele sensível. A marca declara ser vegana, como você prefere.",
    reasons: [
      motivo({
        source: "ingredient_rule",
        text: "Aveia coloidal acalma pele sensível.",
        ingredientName: "Extrato de aveia",
        profileTagSlug: "reativa",
      }),
      motivo({
        source: "preference",
        text: "A marca declara ser vegana, como você prefere.",
      }),
      motivo({
        source: "base_score",
        text: "Qualidade do produto: 84 de 100.",
      }),
    ],
    breakdown: {
      qualityScore: 84,
      qualityPoints: 29.4,
      profilePoints: 50.6,
      healthScore: 88,
      environmentalScore: 80,
      ethicalScore: 90,
      performanceScore: 74,
    },
    ingredientCount: 6,
    unevaluatedIngredientCount: 0,
    calculatedAt: CALCULADA_EM,
    complete: true,
  },

  [mascaraCalmantePantenol.slug]: {
    finalScore: 77,
    recommendationLevel: "recommended",
    riskLevel: "low",
    compatibilityPercentage: 74,
    summary:
      "Nota 77 de 100 - Recomendado. Aveia coloidal acalma pele sensível. Niacinamida ajuda a controlar a oleosidade.",
    reasons: [
      motivo({
        source: "ingredient_rule",
        text: "Aveia coloidal acalma pele sensível.",
        ingredientName: "Extrato de aveia",
        profileTagSlug: "reativa",
      }),
      motivo({
        source: "ingredient_rule",
        text: "Niacinamida ajuda a controlar a oleosidade.",
        ingredientName: "Niacinamida",
        profileTagSlug: "controle-de-oleosidade",
      }),
      motivo({
        source: "base_score",
        text: "Qualidade do produto: 79 de 100.",
      }),
    ],
    breakdown: {
      qualityScore: 79,
      qualityPoints: 27.7,
      profilePoints: 49.3,
      healthScore: 85,
      environmentalScore: 76,
      ethicalScore: 70,
      performanceScore: 72,
    },
    ingredientCount: 6,
    unevaluatedIngredientCount: 0,
    calculatedAt: CALCULADA_EM,
    complete: true,
  },

  [mascaraCapilarNutritiva.slug]: {
    finalScore: 70,
    recommendationLevel: "recommended",
    riskLevel: "low",
    compatibilityPercentage: 68,
    summary:
      "Nota 70 de 100 - Recomendado. A marca declara ser vegana, como você prefere.",
    reasons: [
      motivo({
        source: "preference",
        text: "A marca declara ser vegana, como você prefere.",
      }),
      motivo({
        source: "base_score",
        text: "Qualidade do produto: 72 de 100.",
      }),
    ],
    breakdown: {
      qualityScore: 72,
      qualityPoints: 25.2,
      profilePoints: 44.8,
      healthScore: 78,
      environmentalScore: 70,
      ethicalScore: 80,
      performanceScore: 68,
    },
    ingredientCount: 6,
    unevaluatedIngredientCount: 0,
    calculatedAt: CALCULADA_EM,
    complete: true,
  },
};
