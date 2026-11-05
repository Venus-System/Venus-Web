import type { AnaliseExibicao } from "../types/analise";
import { analisesMock } from "./mocks/analises";
import { simularLatencia } from "./mocks/atraso";
import { ErroProdutoNaoEncontrado } from "./erros";
import { buscarProdutoComVersaoDaApi } from "./api/produtos";
import { USAR_MOCK } from "../config/ambiente";
import { comFallbackDeMock } from "./exposicao";

function analiseNoMock(slug: string): AnaliseExibicao {
  const encontrada = analisesMock[slug];

  if (!encontrada) {
    throw new ErroProdutoNaoEncontrado(slug);
  }

  return encontrada;
}

export async function buscarAnalisePublica(
  slug: string,
  sinal?: AbortSignal,
): Promise<AnaliseExibicao> {
  try {
    if (USAR_MOCK) {
      await simularLatencia();

      return analiseNoMock(slug);
    }

    return await comFallbackDeMock(
      "api",
      async () => {
        const { produto, versaoId, ingredientes } =
          await buscarProdutoComVersaoDaApi(slug, sinal);

        return {
          product: produto,
          versionId: versaoId,
          ingredients: ingredientes,
        };
      },
      () => analiseNoMock(slug),
    );
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
