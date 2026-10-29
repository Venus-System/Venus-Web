import type { AnaliseExibicao } from "../../types/analise";
import type {
  Ingrediente,
  IngredienteAvaliado,
} from "../../types/ingrediente";
import { nivelDoIngrediente } from "../../utils/nivelDoIngrediente";
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

const agua: Ingrediente = {
  inciName: "Aqua",
  commonName: "Água",
  description: "Solvente que forma a base da fórmula.",
  safetySummary: "Sem risco conhecido para a pele ou para o ambiente.",
  biodegradability: 5,
  irritationRiskLevel: 0,
  comedogenicityScore: 0,
  environmentalRiskLevel: 0,
  scientificConfidence: 100,
};

const glicerina: Ingrediente = {
  inciName: "Glycerin",
  commonName: "Glicerina",
  description: "Umectante que puxa água para a camada superficial da pele.",
  safetySummary:
    "Bem tolerada por todos os tipos de pele, inclusive sensível.",
  biodegradability: 5,
  irritationRiskLevel: 0,
  comedogenicityScore: 0,
  environmentalRiskLevel: 1,
  scientificConfidence: 96,
};

const niacinamida: Ingrediente = {
  inciName: "Niacinamide",
  commonName: "Niacinamida",
  description:
    "Forma da vitamina B3 que ajuda a uniformizar o tom e a reforçar a barreira.",
  safetySummary:
    "Ampla literatura de segurança; irritação rara e ligada a peles muito reativas.",
  biodegradability: 4,
  irritationRiskLevel: 1,
  comedogenicityScore: 0,
  environmentalRiskLevel: 1,
  scientificConfidence: 94,
};

const aveia: Ingrediente = {
  inciName: "Avena Sativa Kernel Extract",
  commonName: "Extrato de aveia",
  description: "Calmante de origem vegetal usado em peles reativas.",
  safetySummary:
    "Boa tolerância dermatológica, com relatos raros de alergia.",
  biodegradability: 5,
  irritationRiskLevel: 0,
  comedogenicityScore: 1,
  environmentalRiskLevel: 1,
  scientificConfidence: 88,
};

const pantenol: Ingrediente = {
  inciName: "Panthenol",
  commonName: "Pró-vitamina B5",
  description: "Hidratante que auxilia na reparação da barreira cutânea.",
  safetySummary: "Considerado seguro nas concentrações usuais de cosméticos.",
  biodegradability: 4,
  irritationRiskLevel: 0,
  comedogenicityScore: 0,
  environmentalRiskLevel: 1,
  scientificConfidence: 90,
};

const fenoxietanol: Ingrediente = {
  inciName: "Phenoxyethanol",
  commonName: "Fenoxietanol",
  description: "Conservante que impede a proliferação de microrganismos.",
  safetySummary:
    "Seguro dentro do limite regulatório, mas pode irritar pele sensível.",
  biodegradability: 3,
  irritationRiskLevel: 4,
  comedogenicityScore: 0,
  environmentalRiskLevel: 2,
  scientificConfidence: 92,
};

const alcoolCetearilico: Ingrediente = {
  inciName: "Cetearyl Alcohol",
  commonName: "Álcool cetoestearílico",
  description: "Emoliente e espessante; não resseca como o álcool volátil.",
  safetySummary: "Boa tolerância; pode pesar em pele com tendência a acne.",
  biodegradability: 4,
  irritationRiskLevel: 1,
  comedogenicityScore: 2,
  environmentalRiskLevel: 1,
  scientificConfidence: 90,
};

const ceramida: Ingrediente = {
  inciName: "Ceramide NP",
  commonName: "Ceramida NP",
  description: "Lipídio que repõe um componente natural da barreira da pele.",
  safetySummary: "Sem risco relevante de irritação relatado.",
  biodegradability: 4,
  irritationRiskLevel: 0,
  comedogenicityScore: 0,
  environmentalRiskLevel: 1,
  scientificConfidence: 89,
};

const butilenoGlicol: Ingrediente = {
  inciName: "Butylene Glycol",
  commonName: "Butilenoglicol",
  description: "Veículo que dissolve ativos e melhora o toque da fórmula.",
  safetySummary: "Irritação incomum, concentrada em peles muito sensíveis.",
  biodegradability: 4,
  irritationRiskLevel: 1,
  comedogenicityScore: 1,
  environmentalRiskLevel: 1,
  scientificConfidence: 85,
};

const laurilSulfato: Ingrediente = {
  inciName: "Sodium Lauryl Sulfate",
  commonName: "Lauril sulfato de sódio",
  description:
    "Tensoativo de limpeza com alto poder de remoção de oleosidade.",
  safetySummary:
    "Resseca e irrita com uso frequente, sobretudo em pele seca ou com eczema.",
  biodegradability: 4,
  irritationRiskLevel: 6,
  comedogenicityScore: 1,
  environmentalRiskLevel: 3,
  scientificConfidence: 95,
};

const cocamidopropilBetaina: Ingrediente = {
  inciName: "Cocamidopropyl Betaine",
  commonName: "Cocamidopropil betaína",
  description: "Tensoativo suave usado para equilibrar fórmulas de limpeza.",
  safetySummary: "Alergênico de contato reconhecido, ainda que pouco comum.",
  biodegradability: 4,
  irritationRiskLevel: 4,
  comedogenicityScore: 0,
  environmentalRiskLevel: 2,
  scientificConfidence: 87,
};

const fragrancia: Ingrediente = {
  inciName: "Parfum",
  commonName: "Fragrância",
  description: "Mistura aromática que não tem função de cuidado com a pele.",
  safetySummary:
    "Causa frequente de dermatite de contato; a composição não é aberta no rótulo.",
  biodegradability: 2,
  irritationRiskLevel: 6,
  comedogenicityScore: 0,
  environmentalRiskLevel: 3,
  scientificConfidence: 78,
};

const alcoolDenaturado: Ingrediente = {
  inciName: "Alcohol Denat.",
  commonName: "Álcool desnaturado",
  description: "Solvente volátil que acelera a secagem da fórmula.",
  safetySummary:
    "Em posição alta na lista, compromete a barreira e agrava pele sensível.",
  biodegradability: 5,
  irritationRiskLevel: 7,
  comedogenicityScore: 0,
  environmentalRiskLevel: 2,
  scientificConfidence: 91,
};

const retinol: Ingrediente = {
  inciName: "Retinol",
  commonName: "Retinol",
  description: "Derivado de vitamina A usado na renovação celular.",
  safetySummary:
    "Contraindicado na gestação e irritante no início do uso; exige protetor solar.",
  biodegradability: 3,
  irritationRiskLevel: 7,
  comedogenicityScore: 1,
  environmentalRiskLevel: 2,
  scientificConfidence: 93,
};

function item(
  id: number,
  position: number,
  ingrediente: Ingrediente,
): IngredienteAvaliado {
  return {
    id,
    inciName: ingrediente.inciName,
    position,
    level: nivelDoIngrediente(ingrediente),
    ingredient: ingrediente,
  };
}

export const analisesMock: Record<string, AnaliseExibicao> = {
  [serumCalmanteAveia.slug]: {
    product: serumCalmanteAveia,
    versionId: 1,
    ingredients: [
      item(1, 1, agua),
      item(2, 2, glicerina),
      item(3, 3, niacinamida),
      item(4, 4, aveia),
      item(5, 5, pantenol),
      item(6, 6, fenoxietanol),
    ],
  },

  [hidratanteCeramidas.slug]: {
    product: hidratanteCeramidas,
    versionId: 2,
    ingredients: [
      item(1, 1, agua),
      item(2, 2, glicerina),
      item(7, 3, alcoolCetearilico),
      item(8, 4, ceramida),
      item(9, 5, butilenoGlicol),
      item(6, 6, fenoxietanol),
    ],
  },

  [gelLimpezaPurificante.slug]: {
    product: gelLimpezaPurificante,
    versionId: 3,
    ingredients: [
      item(1, 1, agua),
      item(10, 2, laurilSulfato),
      item(11, 3, cocamidopropilBetaina),
      item(2, 4, glicerina),
      item(12, 5, fragrancia),
    ],
  },

  [locaoClareadoraNoturna.slug]: {
    product: locaoClareadoraNoturna,
    versionId: 4,
    ingredients: [
      item(1, 1, agua),
      item(13, 2, alcoolDenaturado),
      item(14, 3, retinol),
      item(2, 4, glicerina),
      item(12, 5, fragrancia),
    ],
  },

  [oleoCapilarReparador.slug]: {
    product: oleoCapilarReparador,
    versionId: 5,
    ingredients: [
      {
        id: 15,
        inciName: "Bertholletia Excelsa Seed Oil",
        position: 1,
        level: "no-data",
        ingredient: null,
      },
      item(7, 2, alcoolCetearilico),
      item(12, 3, fragrancia),
    ],
  },

  [serumUniformizador.slug]: {
    product: serumUniformizador,
    versionId: 6,
    ingredients: [
      item(1, 1, agua),
      item(3, 2, niacinamida),
      item(9, 3, butilenoGlicol),
      item(2, 4, glicerina),
      item(6, 5, fenoxietanol),
      item(12, 6, fragrancia),
    ],
  },

  [cremeHidratantePerfumado.slug]: {
    product: cremeHidratantePerfumado,
    versionId: 7,
    ingredients: [
      item(1, 1, agua),
      item(7, 2, alcoolCetearilico),
      item(2, 3, glicerina),
      item(12, 4, fragrancia),
      item(6, 5, fenoxietanol),
    ],
  },

  [gelLimpezaSuave.slug]: {
    product: gelLimpezaSuave,
    versionId: 8,
    ingredients: [
      item(1, 1, agua),
      item(11, 2, cocamidopropilBetaina),
      item(2, 3, glicerina),
      item(4, 4, aveia),
      item(5, 5, pantenol),
      item(6, 6, fenoxietanol),
    ],
  },

  [mascaraCalmantePantenol.slug]: {
    product: mascaraCalmantePantenol,
    versionId: 9,
    ingredients: [
      item(1, 1, agua),
      item(5, 2, pantenol),
      item(2, 3, glicerina),
      item(4, 4, aveia),
      item(3, 5, niacinamida),
      item(9, 6, butilenoGlicol),
    ],
  },

  [mascaraCapilarNutritiva.slug]: {
    product: mascaraCapilarNutritiva,
    versionId: 10,
    ingredients: [
      item(1, 1, agua),
      item(7, 2, alcoolCetearilico),
      item(2, 3, glicerina),
      item(5, 4, pantenol),
      item(8, 5, ceramida),
      item(6, 6, fenoxietanol),
    ],
  },
};
