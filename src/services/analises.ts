import type { AnaliseExibicao } from "../types/analise";
import { analisesMock } from "./mocks/analises";
import { simularLatencia } from "./mocks/atraso";
import { ErroProdutoNaoEncontrado } from "./produtos";

const USAR_MOCK = import.meta.env.VITE_USAR_MOCK !== "false";
const URL_API = import.meta.env.VITE_API_URL ?? "";

export async function buscarAnalisePublica(
  slug: string,
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

    const resposta = await fetch(
      `${URL_API}/analises/${encodeURIComponent(slug)}/publica`,
    );

    if (resposta.status === 404) {
      throw new ErroProdutoNaoEncontrado(slug);
    }

    if (!resposta.ok) {
      throw new Error(`A API respondeu ${resposta.status}.`);
    }

    const analise: AnaliseExibicao = await resposta.json();
    return { ...analise, personalized: null };
  } catch (erro) {
    if (erro instanceof ErroProdutoNaoEncontrado) {
      throw erro;
    }

    throw new Error("Não foi possível carregar a análise deste produto.");
  }
}
