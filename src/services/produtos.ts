import type { AnaliseExibicao, ProdutoDetalhado, ProdutoResumo } from '../types';
import { buscar, ErroApi, simularEspera, USAR_MOCK } from './api';
import { ANALISE_PUBLICA, PRODUTOS_DETALHE, PRODUTOS_RESUMO } from './mock/produtos.mock';

export async function listarProdutos(sinal?: AbortSignal): Promise<ProdutoResumo[]> {
  if (USAR_MOCK) {
    return simularEspera(PRODUTOS_RESUMO);
  }
  return buscar<ProdutoResumo[]>('/produtos', sinal);
}

export async function pesquisarProdutos(
  termo: string,
  sinal?: AbortSignal
): Promise<ProdutoResumo[]> {
  const termoLimpo = termo.trim();

  if (USAR_MOCK) {
    const alvo = termoLimpo.toLowerCase();
    const encontrados = PRODUTOS_RESUMO.filter((produto) => {
      const texto = `${produto.nome} ${produto.marca} ${produto.categoria}`.toLowerCase();
      return texto.includes(alvo);
    });
    return simularEspera(encontrados);
  }

  return buscar<ProdutoResumo[]>(`/produtos?busca=${encodeURIComponent(termoLimpo)}`, sinal);
}

export async function obterProduto(
  slug: string,
  sinal?: AbortSignal
): Promise<ProdutoDetalhado> {
  if (USAR_MOCK) {
    const encontrado = PRODUTOS_DETALHE[slug];
    if (!encontrado) {
      throw new ErroApi('Não encontramos esse produto.', 404);
    }
    return simularEspera(encontrado);
  }

  return buscar<ProdutoDetalhado>(`/produtos/${slug}`, sinal);
}

export async function obterAnalise(
  slug: string,
  sinal?: AbortSignal
): Promise<AnaliseExibicao> {
  if (USAR_MOCK) {
    return simularEspera(ANALISE_PUBLICA);
  }
  return buscar<AnaliseExibicao>(`/produtos/${slug}/analise`, sinal);
}
