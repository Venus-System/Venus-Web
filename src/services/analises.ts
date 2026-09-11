import type { AnaliseExibicao } from "../types/analise";
import { analisesMock } from "./mocks/analises";
import { simularLatencia } from "./mocks/atraso";
import { ErroProdutoNaoEncontrado } from "./erros";
import { buscarProdutoDaApi } from "./api/produtos";
import { USAR_MOCK } from "../config/ambiente";

export async function buscarAnalisePublica(
  slug: string,
  sinal?: AbortSignal,
): Promise<AnaliseExibicao> {
  try {
    if (USAR_MOCK) {
      await simularLatencia();
      const encontrada = analisesMock[slug];

      if (!encontrada) {
        throw new ErroProdutoNaoEncontrado(slug);
      }

      return { ...encontrada, personalized: null };
    }

    const produto = await buscarProdutoDaApi(slug, sinal);

    return {
      product: produto,
      ingredients: [],
      personalized: null,
    };
  } catch (erro) {
    if (erro instanceof ErroProdutoNaoEncontrado) {
      throw erro;
    }

    if (erro instanceof DOMException && erro.name === "AbortError") {
      throw erro;
    }

    throw new Error("Não foi possível carregar a análise deste produto.");
  }
}
