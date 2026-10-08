import type { AnaliseExibicao } from "../../types/analise";
import type { Ingrediente } from "../../types/ingrediente";
import {
  gelLimpezaPurificante,
  hidratanteCeramidas,
  locaoClareadoraNoturna,
  oleoCapilarReparador,
  serumCalmanteAveia,
} from "./produtos";

const agua: Ingrediente = {
  inciName: "Aqua",
  commonName: "Água",
  functionSummary: "Solvente que forma a base da fórmula.",
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
  functionSummary: "Umectante que puxa água para a camada superficial da pele.",
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
  functionSummary:
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
  functionSummary: "Calmante de origem vegetal usado em peles reativas.",
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
  functionSummary: "Hidratante que auxilia na reparação da barreira cutânea.",
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
  functionSummary: "Conservante que impede a proliferação de microrganismos.",
  safetySummary:
    "Seguro dentro do limite regulatório, mas pode irritar pele sensível.",
  biodegradability: 3,
  irritationRiskLevel: 2,
  comedogenicityScore: 0,
  environmentalRiskLevel: 2,
  scientificConfidence: 92,
};

const alcoolCetearilico: Ingrediente = {
  inciName: "Cetearyl Alcohol",
  commonName: "Álcool cetoestearílico",
  functionSummary: "Emoliente e espessante; não resseca como o álcool volátil.",
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
  functionSummary: "Lipídio que repõe um componente natural da barreira da pele.",
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
  functionSummary: "Veículo que dissolve ativos e melhora o toque da fórmula.",
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
  functionSummary:
    "Tensoativo de limpeza com alto poder de remoção de oleosidade.",
  safetySummary:
    "Resseca e irrita com uso frequente, sobretudo em pele seca ou com eczema.",
  biodegradability: 4,
  irritationRiskLevel: 3,
  comedogenicityScore: 1,
  environmentalRiskLevel: 3,
  scientificConfidence: 95,
};

const cocamidopropilBetaina: Ingrediente = {
  inciName: "Cocamidopropyl Betaine",
  commonName: "Cocamidopropil betaína",
  functionSummary: "Tensoativo suave usado para equilibrar fórmulas de limpeza.",
  safetySummary: "Alergênico de contato reconhecido, ainda que pouco comum.",
  biodegradability: 4,
  irritationRiskLevel: 2,
  comedogenicityScore: 0,
  environmentalRiskLevel: 2,
  scientificConfidence: 87,
};

const fragrancia: Ingrediente = {
  inciName: "Parfum",
  commonName: "Fragrância",
  functionSummary: "Mistura aromática que não tem função de cuidado com a pele.",
  safetySummary:
    "Causa frequente de dermatite de contato; a composição não é aberta no rótulo.",
  biodegradability: 2,
  irritationRiskLevel: 3,
  comedogenicityScore: 0,
  environmentalRiskLevel: 3,
  scientificConfidence: 78,
};

const alcoolDenaturado: Ingrediente = {
  inciName: "Alcohol Denat.",
  commonName: "Álcool desnaturado",
  functionSummary: "Solvente volátil que acelera a secagem da fórmula.",
  safetySummary:
    "Em posição alta na lista, compromete a barreira e agrava pele sensível.",
  biodegradability: 5,
  irritationRiskLevel: 4,
  comedogenicityScore: 0,
  environmentalRiskLevel: 2,
  scientificConfidence: 91,
};

const retinol: Ingrediente = {
  inciName: "Retinol",
  commonName: "Retinol",
  functionSummary: "Derivado de vitamina A usado na renovação celular.",
  safetySummary:
    "Contraindicado na gestação e irritante no início do uso; exige protetor solar.",
  biodegradability: 3,
  irritationRiskLevel: 4,
  comedogenicityScore: 1,
  environmentalRiskLevel: 2,
  scientificConfidence: 93,
};

export const analisesMock: Record<string, AnaliseExibicao> = {
  [serumCalmanteAveia.slug]: {
    product: serumCalmanteAveia,
    ingredients: [
      {
        id: 1,
        inciName: agua.inciName,
        position: 1,
        level: "safe",
        ingredient: agua,
      },
      {
        id: 2,
        inciName: glicerina.inciName,
        position: 2,
        level: "safe",
        ingredient: glicerina,
      },
      {
        id: 3,
        inciName: niacinamida.inciName,
        position: 3,
        level: "safe",
        ingredient: niacinamida,
      },
      {
        id: 4,
        inciName: aveia.inciName,
        position: 4,
        level: "safe",
        ingredient: aveia,
      },
      {
        id: 5,
        inciName: pantenol.inciName,
        position: 5,
        level: "safe",
        ingredient: pantenol,
      },
      {
        id: 6,
        inciName: fenoxietanol.inciName,
        position: 6,
        level: "warning",
        ingredient: fenoxietanol,
      },
    ],
    personalized: null,
  },

  [hidratanteCeramidas.slug]: {
    product: hidratanteCeramidas,
    ingredients: [
      {
        id: 7,
        inciName: agua.inciName,
        position: 1,
        level: "safe",
        ingredient: agua,
      },
      {
        id: 8,
        inciName: glicerina.inciName,
        position: 2,
        level: "safe",
        ingredient: glicerina,
      },
      {
        id: 9,
        inciName: alcoolCetearilico.inciName,
        position: 3,
        level: "safe",
        ingredient: alcoolCetearilico,
      },
      {
        id: 10,
        inciName: ceramida.inciName,
        position: 4,
        level: "safe",
        ingredient: ceramida,
      },
      {
        id: 11,
        inciName: butilenoGlicol.inciName,
        position: 5,
        level: "safe",
        ingredient: butilenoGlicol,
      },
      {
        id: 12,
        inciName: fenoxietanol.inciName,
        position: 6,
        level: "warning",
        ingredient: fenoxietanol,
      },
    ],
    personalized: null,
  },

  [gelLimpezaPurificante.slug]: {
    product: gelLimpezaPurificante,
    ingredients: [
      {
        id: 13,
        inciName: agua.inciName,
        position: 1,
        level: "safe",
        ingredient: agua,
      },
      {
        id: 14,
        inciName: laurilSulfato.inciName,
        position: 2,
        level: "warning",
        ingredient: laurilSulfato,
      },
      {
        id: 15,
        inciName: cocamidopropilBetaina.inciName,
        position: 3,
        level: "warning",
        ingredient: cocamidopropilBetaina,
      },
      {
        id: 16,
        inciName: glicerina.inciName,
        position: 4,
        level: "safe",
        ingredient: glicerina,
      },
      {
        id: 17,
        inciName: fragrancia.inciName,
        position: 5,
        level: "warning",
        ingredient: fragrancia,
      },
    ],
    personalized: null,
  },

  [locaoClareadoraNoturna.slug]: {
    product: locaoClareadoraNoturna,
    ingredients: [
      {
        id: 18,
        inciName: agua.inciName,
        position: 1,
        level: "safe",
        ingredient: agua,
      },
      {
        id: 19,
        inciName: alcoolDenaturado.inciName,
        position: 2,
        level: "avoid",
        ingredient: alcoolDenaturado,
      },
      {
        id: 20,
        inciName: retinol.inciName,
        position: 3,
        level: "avoid",
        ingredient: retinol,
      },
      {
        id: 21,
        inciName: glicerina.inciName,
        position: 4,
        level: "safe",
        ingredient: glicerina,
      },
      {
        id: 22,
        inciName: fragrancia.inciName,
        position: 5,
        level: "warning",
        ingredient: fragrancia,
      },
    ],
    personalized: null,
  },

  [oleoCapilarReparador.slug]: {
    product: oleoCapilarReparador,
    ingredients: [
      {
        id: 23,
        inciName: "Bertholletia Excelsa Seed Oil",
        position: 1,
        level: "no-data",
        ingredient: null,
      },
      {
        id: 24,
        inciName: alcoolCetearilico.inciName,
        position: 2,
        level: "safe",
        ingredient: alcoolCetearilico,
      },
      {
        id: 25,
        inciName: fragrancia.inciName,
        position: 3,
        level: "warning",
        ingredient: fragrancia,
      },
    ],
    personalized: null,
  },
};
