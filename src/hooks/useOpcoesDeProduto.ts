import { buscarProdutos } from "../services/produtos";
import type { Produto } from "../types/produto";
import { useRequisicao } from "./useRequisicao";

const POR_NOME = new Intl.Collator("pt-BR");

function buscarEmOrdemAlfabetica(sinal: AbortSignal): Promise<Produto[]> {
  return buscarProdutos(undefined, sinal).then((produtos) =>
    [...produtos].sort((a, b) => POR_NOME.compare(a.name, b.name)),
  );
}

export function useOpcoesDeProduto() {
  return useRequisicao(
    buscarEmOrdemAlfabetica,
    "Não foi possível carregar os produtos.",
  );
}
