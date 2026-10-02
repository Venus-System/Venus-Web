import { URL_API } from "../../config/ambiente";
import type {
  Avaliacao,
  Denuncia,
  NovaAvaliacao,
  VotoDeAvaliacao,
  VotosDaAvaliacao,
} from "../../types/avaliacao";
import { ROTULO_DO_MOTIVO_DE_DENUNCIA } from "../../utils/motivosDenuncia";
import { ErroAvaliacaoDuplicada } from "../erros";
import { lerPaginas } from "./analises";
import { comoObjeto, lerTodos, numero, texto } from "./leitura";
import { buscarProdutoComVersaoDaApi } from "./produtos";
import { pedir, verificarResposta } from "./requisicao";

const VOTOS: Record<VotoDeAvaliacao, string> = {
  useful: "USEFUL",
  not_useful: "NOT_USEFUL",
};

export interface AvaliacoesLidas {
  avaliacoes: Avaliacao[];
  truncated: boolean;
}

function lerAvaliacao(
  valor: unknown,
  usuarioId: number | null,
): Avaliacao | null {
  const dados = comoObjeto(valor);
  const id = numero(dados.id);
  const rating = numero(dados.rating);
  const createdAt = texto(dados.createdAt);

  if (id === null || rating === null || createdAt === null) {
    return null;
  }

  return {
    id: String(id),
    authorName: texto(dados.authorName),
    isMine: usuarioId !== null && numero(dados.userId) === usuarioId,
    rating,
    title: texto(dados.title) ?? "",
    comment: texto(dados.comment) ?? "",
    verifiedUse: dados.verifiedUse === true,
    createdAt,
  };
}

function lerVoto(valor: unknown): VotoDeAvaliacao | null {
  const tipo = texto(comoObjeto(valor).voteType);

  if (tipo === VOTOS.useful) {
    return "useful";
  }

  return tipo === VOTOS.not_useful ? "not_useful" : null;
}

async function versaoDoProduto(
  slug: string,
  sinal?: AbortSignal,
): Promise<number | null> {
  const { versaoId } = await buscarProdutoComVersaoDaApi(slug, sinal);

  return versaoId;
}

export async function buscarAvaliacoesNaApi(
  slug: string,
  usuarioId: number | null,
  sinal?: AbortSignal,
): Promise<AvaliacoesLidas> {
  const versaoId = await versaoDoProduto(slug, sinal);

  if (versaoId === null) {
    return { avaliacoes: [], truncated: false };
  }

  const paginas = await lerPaginas(
    `/api/reviews/product-version/${versaoId}`,
    sinal,
  );

  return {
    avaliacoes: lerTodos(paginas.itens, (item) =>
      lerAvaliacao(item, usuarioId),
    ),
    truncated: paginas.truncated,
  };
}

export async function publicarAvaliacaoNaApi(
  usuarioId: number,
  slug: string,
  nova: NovaAvaliacao,
): Promise<Avaliacao> {
  const versaoId = await versaoDoProduto(slug);

  if (versaoId === null) {
    throw new Error("Este produto ainda não pode receber avaliações.");
  }

  const caminho = "/api/reviews";
  const resposta = await pedir(`${URL_API}${caminho}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: usuarioId,
      productVersionId: versaoId,
      rating: nova.rating,
      title: nova.title.trim(),
      comment: nova.comment.trim(),
      verifiedUse: nova.verifiedUse,
    }),
  });

  if (resposta.status === 409) {
    throw new ErroAvaliacaoDuplicada();
  }

  verificarResposta(resposta, caminho);

  const criada = lerAvaliacao(await resposta.json(), usuarioId);

  if (criada === null) {
    throw new Error("A avaliação criada não veio no formato esperado.");
  }

  return criada;
}

export async function buscarVotosNaApi(
  avaliacaoId: string,
  usuarioId: number | null,
  sinal?: AbortSignal,
): Promise<VotosDaAvaliacao> {
  const caminhoDaContagem = `/api/review-votes/review/${avaliacaoId}/count?voteType=${VOTOS.useful}`;
  const contagem = await pedir(`${URL_API}${caminhoDaContagem}`, {
    signal: sinal,
  });

  verificarResposta(contagem, caminhoDaContagem);

  const usefulCount = numero(await contagem.json()) ?? 0;

  if (usuarioId === null) {
    return { usefulCount, myVote: null };
  }

  const caminhoDoVoto = `/api/review-votes/review/${avaliacaoId}/user/${usuarioId}`;
  const voto = await pedir(`${URL_API}${caminhoDoVoto}`, { signal: sinal });

  if (voto.status === 404) {
    return { usefulCount, myVote: null };
  }

  verificarResposta(voto, caminhoDoVoto);

  return { usefulCount, myVote: lerVoto(await voto.json()) };
}

export async function votarNaApi(
  avaliacaoId: string,
  usuarioId: number,
  novo: VotoDeAvaliacao | null,
  anterior: VotoDeAvaliacao | null,
): Promise<void> {
  const caminhoDoVoto = `/api/review-votes/review/${avaliacaoId}/user/${usuarioId}`;

  if (novo === null) {
    const resposta = await pedir(`${URL_API}${caminhoDoVoto}`, {
      method: "DELETE",
    });

    if (resposta.status !== 404) {
      verificarResposta(resposta, caminhoDoVoto);
    }

    return;
  }

  const caminho = anterior === null ? "/api/review-votes" : caminhoDoVoto;
  const resposta = await pedir(`${URL_API}${caminho}`, {
    method: anterior === null ? "POST" : "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      reviewId: Number(avaliacaoId),
      userId: usuarioId,
      voteType: VOTOS[novo],
    }),
  });

  verificarResposta(resposta, caminho);
}

export async function denunciarNaApi(
  usuarioId: number,
  avaliacaoId: string,
  denuncia: Denuncia,
): Promise<void> {
  const rotulo = ROTULO_DO_MOTIVO_DE_DENUNCIA[denuncia.reason];
  const comentario = denuncia.comment.trim();
  const caminho = "/api/reports";

  const resposta = await pedir(`${URL_API}${caminho}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: usuarioId,
      adminUserId: null,
      targetType: "REVIEW",
      targetId: Number(avaliacaoId),
      reason: comentario === "" ? rotulo : `${rotulo}. ${comentario}`,
      status: "OPEN",
    }),
  });

  verificarResposta(resposta, caminho);
}
