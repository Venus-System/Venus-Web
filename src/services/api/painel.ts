import { URL_API } from "../../config/ambiente";
import type { NivelRecomendacao } from "../../types/analise";
import type {
  ContagemPorPeriodo,
  Painel,
  ResumoDasAnalises,
} from "../../types/painel";
import {
  lerAnalise,
  lerNotaPessoal,
  lerPaginas,
  lerTodos,
  maisRecentePorVersao,
  montarAnalises,
} from "./analises";
import type { AnaliseLida, NotaPessoalLida } from "./analises";
import { numero } from "./leitura";
import { pedir, verificarResposta } from "./requisicao";

const QUANTIDADE_DE_RECENTES = 5;

function ehDesteMes(data: string): boolean {
  const lida = new Date(data);
  const hoje = new Date();

  return (
    lida.getFullYear() === hoje.getFullYear() &&
    lida.getMonth() === hoje.getMonth()
  );
}

function contarPorPeriodo(
  datas: string[],
  truncated: boolean,
): ContagemPorPeriodo {
  return {
    total: datas.length,
    thisMonth: datas.filter(ehDesteMes).length,
    truncated,
  };
}

function media(valores: (number | null)[]): number | null {
  const presentes = valores.filter((valor): valor is number => valor !== null);

  if (presentes.length === 0) {
    return null;
  }

  const soma = presentes.reduce((total, valor) => total + valor, 0);

  return Math.round(soma / presentes.length);
}

function contarNiveis(
  notas: NotaPessoalLida[],
  niveis: NivelRecomendacao[],
): number {
  return notas.filter(
    (nota) =>
      nota.recommendationLevel !== null &&
      niveis.includes(nota.recommendationLevel),
  ).length;
}

function resumir(
  notas: NotaPessoalLida[],
  analises: AnaliseLida[],
): ResumoDasAnalises {
  const ultimasAnalises = maisRecentePorVersao(analises);

  return {
    productCount: notas.length,
    averageScore: media(notas.map((nota) => nota.finalScore)),
    healthScore: media(ultimasAnalises.map((analise) => analise.healthScore)),
    environmentalScore: media(
      ultimasAnalises.map((analise) => analise.environmentalScore),
    ),
    ethicalScore: media(ultimasAnalises.map((analise) => analise.ethicalScore)),
    approved: contarNiveis(notas, ["ideal", "recommended"]),
    warning: contarNiveis(notas, ["acceptable"]),
    replace: contarNiveis(notas, ["not_recommended", "contraindicated"]),
  };
}

async function contarFavoritos(
  usuarioId: number,
  sinal?: AbortSignal,
): Promise<number> {
  const caminho = `/api/favorites/user/${usuarioId}/count`;
  const resposta = await pedir(`${URL_API}${caminho}`, { signal: sinal });

  verificarResposta(resposta, caminho);

  return numero(await resposta.json()) ?? 0;
}

export async function buscarPainelNaApi(
  usuarioId: number,
  sinal?: AbortSignal,
): Promise<Omit<Painel, "profileCompleteness">> {
  const [paginasDeAnalises, paginasDeNotas, favoriteCount] = await Promise.all([
    lerPaginas(`/api/analysis-results/user/${usuarioId}`, sinal),
    lerPaginas(`/api/personalized-scores/user/${usuarioId}`, sinal),
    contarFavoritos(usuarioId, sinal),
  ]);

  const analises = lerTodos(paginasDeAnalises.itens, lerAnalise);
  const notas = maisRecentePorVersao(
    lerTodos(paginasDeNotas.itens, lerNotaPessoal),
  );
  const alertas = notas.filter(
    (nota) => nota.recommendationLevel === "contraindicated",
  );
  const maisAntiga =
    analises.length === 0 ? undefined : analises[analises.length - 1];

  return {
    analyses: contarPorPeriodo(
      analises.map((analise) => analise.createdAt),
      paginasDeAnalises.truncated,
    ),
    alerts: contarPorPeriodo(
      alertas.map((nota) => nota.createdAt),
      paginasDeNotas.truncated,
    ),
    firstAnalysisAt:
      paginasDeAnalises.truncated || maisAntiga === undefined
        ? null
        : maisAntiga.createdAt,
    favoriteCount,
    summary: resumir(notas, analises),
    recentAnalyses: await montarAnalises(
      analises.slice(0, QUANTIDADE_DE_RECENTES),
      notas,
      sinal,
    ),
    recommendedSwap: null,
  };
}
