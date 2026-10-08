import type { Produto } from "./produto";

export interface FiltrosDaPesquisa {
  termo: string;
  categoria: string;
  marca: string;
}

export interface ResultadoDaPesquisa {
  produtos: Produto[];
  temMais: boolean;
}

export interface OpcoesDaPesquisa {
  categorias: string[];
  marcas: string[];
}
