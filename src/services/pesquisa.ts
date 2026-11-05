import type { Produto } from "../types/produto";
import type {
  FiltrosDaPesquisa,
  OpcoesDaPesquisa,
  ResultadoDaPesquisa,
} from "../types/pesquisa";
import { USAR_MOCK } from "../config/ambiente";
import { comFallbackDeMock } from "./exposicao";
import { simularLatencia } from "./mocks/atraso";
import { produtosMock } from "./mocks/produtos";
import {
  listarOpcoesDaPesquisaNaApi,
  pesquisarProdutosNaApi,
} from "./api/produtos";

export const PRODUTOS_POR_PAGINA = 20;

const POR_NOME = new Intl.Collator("pt-BR");

function atendeAosFiltros(
  produto: Produto,
  filtros: FiltrosDaPesquisa,
): boolean {
  const termo = filtros.termo.toLowerCase();

  return (
    (termo === "" || produto.name.toLowerCase().includes(termo)) &&
    (filtros.categoria === "" || produto.category === filtros.categoria) &&
    (filtros.marca === "" || produto.brand.name === filtros.marca)
  );
}

function semRepeticao(nomes: string[]): string[] {
  return [...new Set(nomes)].sort((a, b) => POR_NOME.compare(a, b));
}

function pesquisaNoMock(
  filtros: FiltrosDaPesquisa,
  pagina: number,
): ResultadoDaPesquisa {
  const encontrados = produtosMock
    .filter((produto) => atendeAosFiltros(produto, filtros))
    .sort((a, b) => POR_NOME.compare(a.name, b.name));
  const inicio = pagina * PRODUTOS_POR_PAGINA;
  const fim = inicio + PRODUTOS_POR_PAGINA;

  return {
    produtos: encontrados.slice(inicio, fim),
    temMais: encontrados.length > fim,
  };
}

function opcoesNoMock(): OpcoesDaPesquisa {
  return {
    categorias: semRepeticao(produtosMock.map((produto) => produto.category)),
    marcas: semRepeticao(produtosMock.map((produto) => produto.brand.name)),
  };
}

export async function pesquisarProdutos(
  filtros: FiltrosDaPesquisa,
  pagina: number,
  sinal?: AbortSignal,
): Promise<ResultadoDaPesquisa> {
  try {
    if (USAR_MOCK) {
      await simularLatencia();

      return pesquisaNoMock(filtros, pagina);
    }

    return await comFallbackDeMock(
      "api",
      () =>
        pesquisarProdutosNaApi(filtros, pagina, PRODUTOS_POR_PAGINA, sinal),
      () => pesquisaNoMock(filtros, pagina),
    );
  } catch (erro) {
    if (erro instanceof DOMException && erro.name === "AbortError") {
      throw erro;
    }

    throw new Error("Não foi possível carregar os produtos.");
  }
}

export async function buscarOpcoesDaPesquisa(): Promise<OpcoesDaPesquisa> {
  try {
    if (USAR_MOCK) {
      await simularLatencia();

      return opcoesNoMock();
    }

    return await comFallbackDeMock(
      "api",
      () => listarOpcoesDaPesquisaNaApi(),
      opcoesNoMock,
    );
  } catch {
    throw new Error("Não foi possível carregar as categorias e as marcas.");
  }
}
