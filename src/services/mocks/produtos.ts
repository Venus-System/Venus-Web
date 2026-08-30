import type { Marca, Produto } from "../../types/produto";

const floraNativa: Marca = {
  name: "Flora Nativa",
  country: "Brasil",
  website: "https://exemplo.floranativa.com.br",
  hasCrueltyFreeClaim: true,
  hasVeganClaim: true,
  isBrazilian: true,
};

const dermalis: Marca = {
  name: "Dermalis",
  country: "França",
  website: "https://exemplo.dermalis.com",
  hasCrueltyFreeClaim: true,
  hasVeganClaim: false,
  isBrazilian: false,
};

const purebase: Marca = {
  name: "Purebase",
  country: "Estados Unidos",
  website: null,
  hasCrueltyFreeClaim: false,
  hasVeganClaim: false,
  isBrazilian: false,
};

const lumine: Marca = {
  name: "Lumine",
  country: "Brasil",
  website: "https://exemplo.lumine.com.br",
  hasCrueltyFreeClaim: true,
  hasVeganClaim: true,
  isBrazilian: true,
};

const raizViva: Marca = {
  name: "Raiz Viva",
  country: null,
  website: null,
  hasCrueltyFreeClaim: false,
  hasVeganClaim: false,
  isBrazilian: false,
};

export const serumCalmanteAveia: Produto = {
  slug: "serum-calmante-aveia",
  name: "Sérum Calmante de Aveia",
  description:
    "Sérum leve para peles sensíveis, com aveia coloidal e niacinamida, sem fragrância adicionada.",
  category: "Sérum facial",
  brand: floraNativa,
  imageUrl: null,
  level: "safe",
  scores: {
    overallScore: 88,
    healthScore: 92,
    environmentalScore: 84,
    ethicalScore: 90,
    performanceScore: 82,
    transparencyScore: 86,
    confidenceScore: 91,
  },
};

export const hidratanteCeramidas: Produto = {
  slug: "hidratante-facial-ceramidas",
  name: "Hidratante Facial com Ceramidas",
  description:
    "Creme de uso diário com ceramidas e glicerina, indicado para restaurar a barreira da pele.",
  category: "Hidratante facial",
  brand: dermalis,
  imageUrl: null,
  level: "safe",
  scores: {
    overallScore: 81,
    healthScore: 87,
    environmentalScore: 72,
    ethicalScore: null,
    performanceScore: 85,
    transparencyScore: 79,
    confidenceScore: 88,
  },
};

export const gelLimpezaPurificante: Produto = {
  slug: "gel-de-limpeza-purificante",
  name: "Gel de Limpeza Purificante",
  description:
    "Gel de limpeza com tensoativos sulfatados e fragrância, voltado para pele oleosa.",
  category: "Limpeza facial",
  brand: purebase,
  imageUrl: null,
  level: "warning",
  scores: {
    overallScore: 58,
    healthScore: 54,
    environmentalScore: 49,
    ethicalScore: 45,
    performanceScore: 76,
    transparencyScore: 52,
    confidenceScore: 80,
  },
};

export const locaoClareadoraNoturna: Produto = {
  slug: "locao-clareadora-noturna",
  name: "Loção Clareadora Noturna",
  description:
    "Loção noturna com retinol e álcool na base da fórmula, com fragrância adicionada.",
  category: "Tratamento facial",
  brand: lumine,
  imageUrl: null,
  level: "avoid",
  scores: {
    overallScore: 31,
    healthScore: 22,
    environmentalScore: 61,
    ethicalScore: 78,
    performanceScore: 70,
    transparencyScore: 64,
    confidenceScore: 83,
  },
};

export const oleoCapilarReparador: Produto = {
  slug: "oleo-capilar-reparador",
  name: "Óleo Capilar Reparador",
  description:
    "Óleo de finalização de fórmula ainda não verificada pela curadoria da Venus.",
  category: "Tratamento capilar",
  brand: raizViva,
  imageUrl: null,
  level: "no-data",
  scores: {
    overallScore: null,
    healthScore: null,
    environmentalScore: null,
    ethicalScore: null,
    performanceScore: null,
    transparencyScore: 24,
    confidenceScore: 12,
  },
};

export const produtosMock: Produto[] = [
  serumCalmanteAveia,
  hidratanteCeramidas,
  gelLimpezaPurificante,
  locaoClareadoraNoturna,
  oleoCapilarReparador,
];
