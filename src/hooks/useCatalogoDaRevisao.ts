import { buscarCatalogoDaRevisao } from "../services/admin";
import type { CatalogoDaRevisao } from "../types/admin";
import { useRequisicao } from "./useRequisicao";
import type { EstadoDaRequisicao } from "./useRequisicao";

export type EstadoCatalogo = EstadoDaRequisicao<CatalogoDaRevisao>;

export function useCatalogoDaRevisao() {
  return useRequisicao(
    buscarCatalogoDaRevisao,
    "Não foi possível carregar as marcas e categorias.",
  );
}
