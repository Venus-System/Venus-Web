import { buscarOpcoesDaPesquisa } from "../services/pesquisa";
import { useRequisicao } from "./useRequisicao";

export function useOpcoesDaPesquisa() {
  return useRequisicao(
    buscarOpcoesDaPesquisa,
    "Não foi possível carregar as categorias e as marcas.",
  );
}
