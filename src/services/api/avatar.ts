import { URL_API } from "../../config/ambiente";
import { pedir, verificarResposta } from "./requisicao";

function lerUrl(valor: unknown): string | null {
  if (typeof valor !== "object" || valor === null || !("url" in valor)) {
    return null;
  }

  return typeof valor.url === "string" && valor.url !== "" ? valor.url : null;
}

export async function buscarAvatarNaApi(
  usuarioId: number,
  sinal?: AbortSignal,
): Promise<string | null> {
  const caminho = `/api/users/${usuarioId}/avatar`;
  const resposta = await pedir(`${URL_API}${caminho}`, { signal: sinal });

  if (resposta.status === 404) {
    return null;
  }

  verificarResposta(resposta, caminho);

  return lerUrl(await resposta.json());
}

export async function enviarAvatarNaApi(
  usuarioId: number,
  arquivo: File,
): Promise<string | null> {
  const caminho = `/api/users/${usuarioId}/avatar`;
  const corpo = new FormData();

  corpo.append("file", arquivo);

  const resposta = await pedir(`${URL_API}${caminho}`, {
    method: "POST",
    body: corpo,
  });

  verificarResposta(resposta, caminho);

  return lerUrl(await resposta.json());
}

export async function apagarAvatarNaApi(usuarioId: number): Promise<void> {
  const caminho = `/api/users/${usuarioId}/avatar`;
  const resposta = await pedir(`${URL_API}${caminho}`, { method: "DELETE" });

  if (resposta.status === 404) {
    return;
  }

  verificarResposta(resposta, caminho);
}
