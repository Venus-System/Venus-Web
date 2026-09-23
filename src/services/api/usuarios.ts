import { URL_API, USAR_MOCK } from "../../config/ambiente";
import type { Usuario } from "../../types/usuario";
import { pedir, verificarResposta } from "./requisicao";

function lerId(valor: unknown): number | null {
  if (typeof valor !== "object" || valor === null || !("id" in valor)) {
    return null;
  }

  return typeof valor.id === "number" ? valor.id : null;
}

export async function buscarIdPorUid(uid: string): Promise<number | null> {
  if (USAR_MOCK) {
    return null;
  }

  const caminho = `/api/users/search?firebaseUid=${encodeURIComponent(uid)}`;
  const resposta = await pedir(`${URL_API}${caminho}`);

  verificarResposta(resposta, caminho);

  const dados: unknown = await resposta.json();

  if (
    typeof dados !== "object" ||
    dados === null ||
    !("content" in dados) ||
    !Array.isArray(dados.content)
  ) {
    return null;
  }

  return dados.content.length === 0 ? null : lerId(dados.content[0]);
}

export async function criarUsuarioNaApi(
  usuario: Usuario,
): Promise<number | null> {
  if (USAR_MOCK) {
    return null;
  }

  const resposta = await pedir(`${URL_API}/api/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firebaseUid: usuario.id,
      name: usuario.name,
      email: usuario.email,
      status: "ACTIVE",
    }),
  });

  verificarResposta(resposta, "/api/users");

  const dados: unknown = await resposta.json();

  return lerId(dados);
}
