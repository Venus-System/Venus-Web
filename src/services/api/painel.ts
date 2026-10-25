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
  maisRecentePorProduto,
  montarAnalises,
} from "./analises";
import type { AnaliseLida, NotaPessoalLida } from "./analises";
import { repassarErro } from "../erros";
import { lerTodos, numero } from "./leitura";
import { produtoDeCadaVersao } from "./produtos";
import { pedir, verificarResposta } from "./requisicao";
import { umaPorDia } from "../../utils/umaPorDia";

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
  ultimasAnalises: AnaliseLida[],
): ResumoDasAnalises {
  return {
    productCount: notas.length,
    averageScore: media(notas.map((nota) => nota.finalScore)),
    healthScore: media(ultimasAnalises.map((analise) => analise.healthScore)),
    environmentalScore: media(
      ultimasAnalises.map((analise) => analise.environmentalScore),
    ),
    ethicalScore: media(ultimasAnalises.map((analise) => analise.ethicalScore)),
    performanceScore: media(
      ultimasAnalises.map((analise) => analise.performanceScore),
    ),
    approved: contarNiveis(notas, ["ideal", "recommended"]),
    warning: contarNiveis(notas, ["acceptable"]),
    replace: contarNiveis(notas, ["not_recommended", "contraindicated"]),
  };
}

async function contarFavoritos(
  usuarioId: number,
  sinal?: AbortSignal,
): Promise<number> {
  try {
    const caminho = `/api/favorites/user/${usuarioId}/count`;
    const resposta = await pedir(`${URL_API}${caminho}`, { signal: sinal });

    verificarResposta(resposta, caminho);

    return numero(await resposta.json()) ?? 0;
  } catch (erro) {
    repassarErro(erro, "Não foi possível contar os favoritos.");
  }
}

export async function buscarPainelNaApi(
  usuarioId: number,
  sinal?: AbortSignal,
): Promise<Omit<Painel, "profileCompleteness">> {
  try {
    const [paginasDeAnalises, paginasDeNotas, favoriteCount, produtoDaVersao] =
      await Promise.all([
        lerPaginas(`/api/analysis-results/user/${usuarioId}`, sinal),
        lerPaginas(`/api/personalized-scores/user/${usuarioId}`, sinal),
        contarFavoritos(usuarioId, sinal),
        produtoDeCadaVersao(sinal).catch(() => new Map<number, number>()),
      ]);

    const analises = lerTodos(paginasDeAnalises.itens, lerAnalise);
    const analisesPorDia = umaPorDia(
      analises,
      (analise) => analise.productVersionId,
      (analise) => analise.createdAt,
    );
    const ultimasAnalises = maisRecentePorProduto(analises, produtoDaVersao);
    const notas = maisRecentePorProduto(
      lerTodos(paginasDeNotas.itens, lerNotaPessoal),
      produtoDaVersao,
    );
    const alertas = notas.filter(
      (nota) => nota.recommendationLevel === "contraindicated",
    );
    const maisAntiga =
      analises.length === 0 ? undefined : analises[analises.length - 1];

    return {
      analyses: contarPorPeriodo(
        analisesPorDia.map((analise) => analise.createdAt),
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
      summary: resumir(notas, ultimasAnalises),
      recentAnalyses: await montarAnalises(
        ultimasAnalises.slice(0, QUANTIDADE_DE_RECENTES),
        notas,
        sinal,
      ),
    };
  } catch (erro) {
    repassarErro(erro, "Não foi possível carregar o painel.");
  }
}
