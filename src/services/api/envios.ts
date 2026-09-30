import type { Envio, SituacaoEnvio } from "../../types/envio";
import { comoObjeto, numero, texto } from "./leitura";
import { buscarProdutoPorIdDaApi } from "./produtos";

const SITUACOES: Partial<Record<string, SituacaoEnvio>> = {
  PENDING_REVIEW: "in_review",
  IN_REVIEW: "in_review",
  APPROVED: "approved",
  SYNC_FAILED: "approved",
  SYNCED: "published",
  REJECTED: "rejected",
};

interface EnvioLido {
  envio: Envio;
  productId: number | null;
}

function lerEnvio(valor: unknown): EnvioLido | null {
  const dados = comoObjeto(valor);
  const id = texto(dados.id);
  const status = SITUACOES[texto(dados.status) ?? ""];

  if (id === null || status === undefined) {
    return null;
  }

  const ocr = comoObjeto(dados.ocr);
  const extraido = comoObjeto(comoObjeto(ocr.front).extracted);
  const frente = comoObjeto(comoObjeto(dados.images).front);
  const revisao = comoObjeto(dados.review);

  return {
    envio: {
      id,
      name: texto(extraido.productName),
      brandName: texto(extraido.brand),
      photoUrl: texto(frente.secureUrl),
      submittedAt: texto(dados.createdAt) ?? texto(dados.startedAt) ?? "",
      status,
      decidedAt: texto(revisao.decidedAt),
      rejectionReason: status === "rejected" ? texto(revisao.reason) : null,
      productSlug: null,
    },
    productId:
      status === "published" ? numero(comoObjeto(dados.sync).productId) : null,
  };
}

async function slugDoProduto(
  produtoId: number,
  sinal?: AbortSignal,
): Promise<string | null> {
  try {
    const produto = await buscarProdutoPorIdDaApi(produtoId, sinal);

    return produto === null ? null : produto.slug;
  } catch {
    return null;
  }
}

export async function lerListaDeEnvios(
  valor: unknown,
  sinal?: AbortSignal,
): Promise<Envio[]> {
  const conteudo = comoObjeto(valor).content;

  if (!Array.isArray(conteudo)) {
    throw new Error("A lista de envios não veio no formato esperado.");
  }

  const lidos = conteudo.flatMap((item) => {
    const lido = lerEnvio(item);

    return lido === null ? [] : [lido];
  });

  const produtos = [
    ...new Set(
      lidos.flatMap((lido) =>
        lido.productId === null ? [] : [lido.productId],
      ),
    ),
  ];

  const slugs = new Map<number, string | null>();

  await Promise.all(
    produtos.map(async (produtoId) => {
      slugs.set(produtoId, await slugDoProduto(produtoId, sinal));
    }),
  );

  return lidos
    .map((lido) => ({
      ...lido.envio,
      productSlug:
        lido.productId === null ? null : (slugs.get(lido.productId) ?? null),
    }))
    .sort((a, b) => Date.parse(b.submittedAt) - Date.parse(a.submittedAt));
}
