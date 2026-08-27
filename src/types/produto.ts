import type { NivelRisco } from "./ingrediente";

export interface Marca {
  nome: string;
  pais: string | null;
  site: string | null;
  temSeloCrueltyFree: boolean;
  temSeloVegano: boolean;
  ehBrasileira: boolean;
}

export interface NotasProduto {
  geral: number;
  saude: number;
  ambiental: number;
  etica: number;
  desempenho: number;
  transparencia: number;
  confianca: number;
}

export interface Produto {
  slug: string;
  nome: string;
  descricao: string;
  categoria: string;
  marca: Marca;
  imagemUrl: string | null;
  nivel: NivelRisco;
  notas: NotasProduto;
}
