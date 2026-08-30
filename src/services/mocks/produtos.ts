import type { Marca, Produto } from "../../types/produto";

const floraNativa: Marca = {
  nome: "Flora Nativa",
  pais: "Brasil",
  site: "https://exemplo.floranativa.com.br",
  temSeloCrueltyFree: true,
  temSeloVegano: true,
  ehBrasileira: true,
};

const dermalis: Marca = {
  nome: "Dermalis",
  pais: "França",
  site: "https://exemplo.dermalis.com",
  temSeloCrueltyFree: true,
  temSeloVegano: false,
  ehBrasileira: false,
};

const purebase: Marca = {
  nome: "Purebase",
  pais: "Estados Unidos",
  site: null,
  temSeloCrueltyFree: false,
  temSeloVegano: false,
  ehBrasileira: false,
};

const lumine: Marca = {
  nome: "Lumine",
  pais: "Brasil",
  site: "https://exemplo.lumine.com.br",
  temSeloCrueltyFree: true,
  temSeloVegano: true,
  ehBrasileira: true,
};

const raizViva: Marca = {
  nome: "Raiz Viva",
  pais: null,
  site: null,
  temSeloCrueltyFree: false,
  temSeloVegano: false,
  ehBrasileira: false,
};

export const serumCalmanteAveia: Produto = {
  slug: "serum-calmante-aveia",
  nome: "Sérum Calmante de Aveia",
  descricao:
    "Sérum leve para peles sensíveis, com aveia coloidal e niacinamida, sem fragrância adicionada.",
  categoria: "Sérum facial",
  marca: floraNativa,
  imagemUrl: null,
  nivel: "seguro",
  notas: {
    geral: 88,
    saude: 92,
    ambiental: 84,
    etica: 90,
    desempenho: 82,
    transparencia: 86,
    confianca: 91,
  },
};

export const hidratanteCeramidas: Produto = {
  slug: "hidratante-facial-ceramidas",
  nome: "Hidratante Facial com Ceramidas",
  descricao:
    "Creme de uso diário com ceramidas e glicerina, indicado para restaurar a barreira da pele.",
  categoria: "Hidratante facial",
  marca: dermalis,
  imagemUrl: null,
  nivel: "seguro",
  notas: {
    geral: 81,
    saude: 87,
    ambiental: 72,
    etica: null,
    desempenho: 85,
    transparencia: 79,
    confianca: 88,
  },
};

export const gelLimpezaPurificante: Produto = {
  slug: "gel-de-limpeza-purificante",
  nome: "Gel de Limpeza Purificante",
  descricao:
    "Gel de limpeza com tensoativos sulfatados e fragrância, voltado para pele oleosa.",
  categoria: "Limpeza facial",
  marca: purebase,
  imagemUrl: null,
  nivel: "atencao",
  notas: {
    geral: 58,
    saude: 54,
    ambiental: 49,
    etica: 45,
    desempenho: 76,
    transparencia: 52,
    confianca: 80,
  },
};

export const locaoClareadoraNoturna: Produto = {
  slug: "locao-clareadora-noturna",
  nome: "Loção Clareadora Noturna",
  descricao:
    "Loção noturna com retinol e álcool na base da fórmula, com fragrância adicionada.",
  categoria: "Tratamento facial",
  marca: lumine,
  imagemUrl: null,
  nivel: "evitar",
  notas: {
    geral: 31,
    saude: 22,
    ambiental: 61,
    etica: 78,
    desempenho: 70,
    transparencia: 64,
    confianca: 83,
  },
};

export const oleoCapilarReparador: Produto = {
  slug: "oleo-capilar-reparador",
  nome: "Óleo Capilar Reparador",
  descricao:
    "Óleo de finalização de fórmula ainda não verificada pela curadoria da Venus.",
  categoria: "Tratamento capilar",
  marca: raizViva,
  imagemUrl: null,
  nivel: "sem-dados",
  notas: {
    geral: null,
    saude: null,
    ambiental: null,
    etica: null,
    desempenho: null,
    transparencia: 24,
    confianca: 12,
  },
};

export const produtosMock: Produto[] = [
  serumCalmanteAveia,
  hidratanteCeramidas,
  gelLimpezaPurificante,
  locaoClareadoraNoturna,
  oleoCapilarReparador,
];
