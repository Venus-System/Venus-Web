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
  geral: number | null;
  saude: number | null;
  ambiental: number | null;
  etica: number | null;
  desempenho: number | null;
  transparencia: number | null;
  confianca: number | null;
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
