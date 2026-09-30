import { URL_API } from "../../config/ambiente";
import type { PaginaDoHistorico } from "../../types/historico";
import {
  lerAnalise,
  lerNotaPessoal,
  lerPaginas,
  lerTodos,
  maisRecentePorVersao,
  montarAnalises,
} from "./analises";
import { comoObjeto } from "./leitura";
import { pedir, verificarResposta } from "./requisicao";

export async function buscarHistoricoNaApi(
  usuarioId: number,
  pagina: number,
  tamanho: number,
  sinal?: AbortSignal,
): Promise<PaginaDoHistorico> {
  const caminho = `/api/analysis-results/user/${usuarioId}?page=${pagina}&size=${tamanho}&sort=createdAt,desc`;

  const [resposta, paginasDeNotas] = await Promise.all([
    pedir(`${URL_API}${caminho}`, { signal: sinal }),
    lerPaginas(`/api/personalized-scores/user/${usuarioId}`, sinal),
  ]);

  verificarResposta(resposta, caminho);

  const dados = comoObjeto(await resposta.json());
  const conteudo = Array.isArray(dados.content) ? dados.content : [];
  const analises = lerTodos(conteudo, lerAnalise);
  const notas = maisRecentePorVersao(
    lerTodos(paginasDeNotas.itens, lerNotaPessoal),
  );

  return {
    items: await montarAnalises(analises, notas, sinal),
    hasMore: dados.last === false,
  };
}
