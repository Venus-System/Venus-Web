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
  nomeInci: "Aqua",
  nomeComum: "Água",
  funcaoResumo: "Solvente que forma a base da fórmula.",
  resumoSeguranca: "Sem risco conhecido para a pele ou para o ambiente.",
  biodegradabilidade: 5,
  riscoIrritacao: 0,
  comedogenicidade: 0,
  riscoAmbiental: 0,
  confiancaCientifica: 100,
};

const glicerina: Ingrediente = {
  nomeInci: "Glycerin",
  nomeComum: "Glicerina",
  funcaoResumo: "Umectante que puxa água para a camada superficial da pele.",
  resumoSeguranca:
    "Bem tolerada por todos os tipos de pele, inclusive sensível.",
  biodegradabilidade: 5,
  riscoIrritacao: 0,
  comedogenicidade: 0,
  riscoAmbiental: 1,
  confiancaCientifica: 96,
};

const niacinamida: Ingrediente = {
  nomeInci: "Niacinamide",
  nomeComum: "Niacinamida",
  funcaoResumo:
    "Forma da vitamina B3 que ajuda a uniformizar o tom e a reforçar a barreira.",
  resumoSeguranca:
    "Ampla literatura de segurança; irritação rara e ligada a peles muito reativas.",
  biodegradabilidade: 4,
  riscoIrritacao: 1,
  comedogenicidade: 0,
  riscoAmbiental: 1,
  confiancaCientifica: 94,
};

const aveia: Ingrediente = {
  nomeInci: "Avena Sativa Kernel Extract",
  nomeComum: "Extrato de aveia",
  funcaoResumo: "Calmante de origem vegetal usado em peles reativas.",
  resumoSeguranca:
    "Boa tolerância dermatológica, com relatos raros de alergia.",
  biodegradabilidade: 5,
  riscoIrritacao: 0,
  comedogenicidade: 1,
  riscoAmbiental: 1,
  confiancaCientifica: 88,
};

const pantenol: Ingrediente = {
  nomeInci: "Panthenol",
  nomeComum: "Pró-vitamina B5",
  funcaoResumo: "Hidratante que auxilia na reparação da barreira cutânea.",
  resumoSeguranca: "Considerado seguro nas concentrações usuais de cosméticos.",
  biodegradabilidade: 4,
  riscoIrritacao: 0,
  comedogenicidade: 0,
  riscoAmbiental: 1,
  confiancaCientifica: 90,
};

const fenoxietanol: Ingrediente = {
  nomeInci: "Phenoxyethanol",
  nomeComum: "Fenoxietanol",
  funcaoResumo: "Conservante que impede a proliferação de microrganismos.",
  resumoSeguranca:
    "Seguro dentro do limite regulatório, mas pode irritar pele sensível.",
  biodegradabilidade: 3,
  riscoIrritacao: 2,
  comedogenicidade: 0,
  riscoAmbiental: 2,
  confiancaCientifica: 92,
};

const alcoolCetearilico: Ingrediente = {
  nomeInci: "Cetearyl Alcohol",
  nomeComum: "Álcool cetoestearílico",
  funcaoResumo: "Emoliente e espessante; não resseca como o álcool volátil.",
  resumoSeguranca: "Boa tolerância; pode pesar em pele com tendência a acne.",
  biodegradabilidade: 4,
  riscoIrritacao: 1,
  comedogenicidade: 2,
  riscoAmbiental: 1,
  confiancaCientifica: 90,
};

const ceramida: Ingrediente = {
  nomeInci: "Ceramide NP",
  nomeComum: "Ceramida NP",
  funcaoResumo: "Lipídio que repõe um componente natural da barreira da pele.",
  resumoSeguranca: "Sem risco relevante de irritação relatado.",
  biodegradabilidade: 4,
  riscoIrritacao: 0,
  comedogenicidade: 0,
  riscoAmbiental: 1,
  confiancaCientifica: 89,
};

const butilenoGlicol: Ingrediente = {
  nomeInci: "Butylene Glycol",
  nomeComum: "Butilenoglicol",
  funcaoResumo: "Veículo que dissolve ativos e melhora o toque da fórmula.",
  resumoSeguranca: "Irritação incomum, concentrada em peles muito sensíveis.",
  biodegradabilidade: 4,
  riscoIrritacao: 1,
  comedogenicidade: 1,
  riscoAmbiental: 1,
  confiancaCientifica: 85,
};

const laurilSulfato: Ingrediente = {
  nomeInci: "Sodium Lauryl Sulfate",
  nomeComum: "Lauril sulfato de sódio",
  funcaoResumo:
    "Tensoativo de limpeza com alto poder de remoção de oleosidade.",
  resumoSeguranca:
    "Resseca e irrita com uso frequente, sobretudo em pele seca ou com eczema.",
  biodegradabilidade: 4,
  riscoIrritacao: 3,
  comedogenicidade: 1,
  riscoAmbiental: 3,
  confiancaCientifica: 95,
};

const cocamidopropilBetaina: Ingrediente = {
  nomeInci: "Cocamidopropyl Betaine",
  nomeComum: "Cocamidopropil betaína",
  funcaoResumo: "Tensoativo suave usado para equilibrar fórmulas de limpeza.",
  resumoSeguranca: "Alergênico de contato reconhecido, ainda que pouco comum.",
  biodegradabilidade: 4,
  riscoIrritacao: 2,
  comedogenicidade: 0,
  riscoAmbiental: 2,
  confiancaCientifica: 87,
};

const fragrancia: Ingrediente = {
  nomeInci: "Parfum",
  nomeComum: "Fragrância",
  funcaoResumo: "Mistura aromática que não tem função de cuidado com a pele.",
  resumoSeguranca:
    "Causa frequente de dermatite de contato; a composição não é aberta no rótulo.",
  biodegradabilidade: 2,
  riscoIrritacao: 3,
  comedogenicidade: 0,
  riscoAmbiental: 3,
  confiancaCientifica: 78,
};

const alcoolDenaturado: Ingrediente = {
  nomeInci: "Alcohol Denat.",
  nomeComum: "Álcool desnaturado",
  funcaoResumo: "Solvente volátil que acelera a secagem da fórmula.",
  resumoSeguranca:
    "Em posição alta na lista, compromete a barreira e agrava pele sensível.",
  biodegradabilidade: 5,
  riscoIrritacao: 4,
  comedogenicidade: 0,
  riscoAmbiental: 2,
  confiancaCientifica: 91,
};

const retinol: Ingrediente = {
  nomeInci: "Retinol",
  nomeComum: "Retinol",
  funcaoResumo: "Derivado de vitamina A usado na renovação celular.",
  resumoSeguranca:
    "Contraindicado na gestação e irritante no início do uso; exige protetor solar.",
  biodegradabilidade: 3,
  riscoIrritacao: 4,
  comedogenicidade: 1,
  riscoAmbiental: 2,
  confiancaCientifica: 93,
};

export const analisesMock: Record<string, AnaliseExibicao> = {
  [serumCalmanteAveia.slug]: {
    produto: serumCalmanteAveia,
    ingredientes: [
      {
        nomeInci: agua.nomeInci,
        posicao: 1,
        nivel: "seguro",
        ingrediente: agua,
      },
      {
        nomeInci: glicerina.nomeInci,
        posicao: 2,
        nivel: "seguro",
        ingrediente: glicerina,
      },
      {
        nomeInci: niacinamida.nomeInci,
        posicao: 3,
        nivel: "seguro",
        ingrediente: niacinamida,
      },
      {
        nomeInci: aveia.nomeInci,
        posicao: 4,
        nivel: "seguro",
        ingrediente: aveia,
      },
      {
        nomeInci: pantenol.nomeInci,
        posicao: 5,
        nivel: "seguro",
        ingrediente: pantenol,
      },
      {
        nomeInci: fenoxietanol.nomeInci,
        posicao: 6,
        nivel: "atencao",
        ingrediente: fenoxietanol,
      },
    ],
    personalizada: null,
  },

  [hidratanteCeramidas.slug]: {
    produto: hidratanteCeramidas,
    ingredientes: [
      {
        nomeInci: agua.nomeInci,
        posicao: 1,
        nivel: "seguro",
        ingrediente: agua,
      },
      {
        nomeInci: glicerina.nomeInci,
        posicao: 2,
        nivel: "seguro",
        ingrediente: glicerina,
      },
      {
        nomeInci: alcoolCetearilico.nomeInci,
        posicao: 3,
        nivel: "seguro",
        ingrediente: alcoolCetearilico,
      },
      {
        nomeInci: ceramida.nomeInci,
        posicao: 4,
        nivel: "seguro",
        ingrediente: ceramida,
      },
      {
        nomeInci: butilenoGlicol.nomeInci,
        posicao: 5,
        nivel: "seguro",
        ingrediente: butilenoGlicol,
      },
      {
        nomeInci: fenoxietanol.nomeInci,
        posicao: 6,
        nivel: "atencao",
        ingrediente: fenoxietanol,
      },
    ],
    personalizada: null,
  },

  [gelLimpezaPurificante.slug]: {
    produto: gelLimpezaPurificante,
    ingredientes: [
      {
        nomeInci: agua.nomeInci,
        posicao: 1,
        nivel: "seguro",
        ingrediente: agua,
      },
      {
        nomeInci: laurilSulfato.nomeInci,
        posicao: 2,
        nivel: "atencao",
        ingrediente: laurilSulfato,
      },
      {
        nomeInci: cocamidopropilBetaina.nomeInci,
        posicao: 3,
        nivel: "atencao",
        ingrediente: cocamidopropilBetaina,
      },
      {
        nomeInci: glicerina.nomeInci,
        posicao: 4,
        nivel: "seguro",
        ingrediente: glicerina,
      },
      {
        nomeInci: fragrancia.nomeInci,
        posicao: 5,
        nivel: "atencao",
        ingrediente: fragrancia,
      },
    ],
    personalizada: null,
  },

  [locaoClareadoraNoturna.slug]: {
    produto: locaoClareadoraNoturna,
    ingredientes: [
      {
        nomeInci: agua.nomeInci,
        posicao: 1,
        nivel: "seguro",
        ingrediente: agua,
      },
      {
        nomeInci: alcoolDenaturado.nomeInci,
        posicao: 2,
        nivel: "evitar",
        ingrediente: alcoolDenaturado,
      },
      {
        nomeInci: retinol.nomeInci,
        posicao: 3,
        nivel: "evitar",
        ingrediente: retinol,
      },
      {
        nomeInci: glicerina.nomeInci,
        posicao: 4,
        nivel: "seguro",
        ingrediente: glicerina,
      },
      {
        nomeInci: fragrancia.nomeInci,
        posicao: 5,
        nivel: "atencao",
        ingrediente: fragrancia,
      },
    ],
    personalizada: null,
  },

  [oleoCapilarReparador.slug]: {
    produto: oleoCapilarReparador,
    ingredientes: [
      {
        nomeInci: "Bertholletia Excelsa Seed Oil",
        posicao: 1,
        nivel: "sem-dados",
        ingrediente: null,
      },
      {
        nomeInci: alcoolCetearilico.nomeInci,
        posicao: 2,
        nivel: "seguro",
        ingrediente: alcoolCetearilico,
      },
      {
        nomeInci: fragrancia.nomeInci,
        posicao: 3,
        nivel: "atencao",
        ingrediente: fragrancia,
      },
    ],
    personalizada: null,
  },
};
