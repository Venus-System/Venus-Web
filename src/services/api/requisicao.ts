import { ErroServicoIndisponivel } from "../erros";

export async function pedir(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (erro) {
    if (erro instanceof DOMException && erro.name === "AbortError") {
      throw erro;
    }

    throw new ErroServicoIndisponivel();
  }
}

export function verificarResposta(resposta: Response, caminho: string): void {
  if (resposta.ok) {
    return;
  }

  if (resposta.status >= 500) {
    throw new ErroServicoIndisponivel();
  }

  throw new Error(`A API respondeu ${resposta.status} em ${caminho}.`);
}
