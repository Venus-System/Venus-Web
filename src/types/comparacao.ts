import type { IngredienteAvaliado } from "./ingrediente";
import type { Produto } from "./produto";

export interface ProdutoComparado {
  product: Produto;
  ingredients: IngredienteAvaliado[];
}
