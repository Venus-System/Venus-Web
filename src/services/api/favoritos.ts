import { URL_API } from "../../config/ambiente";
import type { Produto } from "../../types/produto";
import { lerPaginas } from "./analises";
import { comoObjeto, lerTodos, numero } from "./leitura";
import { buscarIdPorSlug, buscarProdutoPorIdDaApi } from "./produtos";
import { pedir, verificarResposta } from "./requisicao";

export async function buscarFavoritosNaApi(
  usuarioId: number,
  sinal?: AbortSignal,
): Promise<Produto[]> {
  const paginas = await lerPaginas(`/api/favorites/user/${usuarioId}`, sinal);
  const ids = [
    ...new Set(
      lerTodos(paginas.itens, (item) => numero(comoObjeto(item).productId)),
    ),
  ];

  const produtos = await Promise.all(
    ids.map((id) => buscarProdutoPorIdDaApi(id, sinal)),
  );

  return produtos.filter((produto): produto is Produto => produto !== null);
}

export async function favoritarNaApi(
  usuarioId: number,
  slug: string,
): Promise<void> {
  const produtoId = await buscarIdPorSlug(slug);
  const caminho = "/api/favorites";
  const resposta = await pedir(`${URL_API}${caminho}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: usuarioId, productId: produtoId }),
  });

  if (resposta.status === 409) {
    return;
  }

  verificarResposta(resposta, caminho);
}

export async function desfavoritarNaApi(
  usuarioId: number,
  slug: string,
): Promise<void> {
  const produtoId = await buscarIdPorSlug(slug);
  const caminho = `/api/favorites/user/${usuarioId}/product/${produtoId}`;
  const resposta = await pedir(`${URL_API}${caminho}`, { method: "DELETE" });

  if (resposta.status === 404) {
    return;
  }

  verificarResposta(resposta, caminho);
}
