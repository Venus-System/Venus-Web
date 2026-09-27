import { autenticacaoFirebase } from "../../config/firebase";
import { ErroServicoIndisponivel } from "../erros";

async function tokenDoUsuario(): Promise<string | null> {
  const conta = autenticacaoFirebase?.currentUser ?? null;

  if (conta === null) {
    return null;
  }

  try {
    return await conta.getIdToken();
  } catch {
    return null;
  }
}

async function comToken(init: RequestInit = {}): Promise<RequestInit> {
  const cabecalhos = new Headers(init.headers);

  if (cabecalhos.has("Authorization")) {
    return init;
  }

  const token = await tokenDoUsuario();

  if (token === null) {
    return init;
  }

  cabecalhos.set("Authorization", `Bearer ${token}`);

  return { ...init, headers: cabecalhos };
}

export async function pedir(
  url: string,
  init?: RequestInit,
  enviarTokenDoUsuario = true,
): Promise<Response> {
  try {
    const opcoes = enviarTokenDoUsuario ? await comToken(init) : init;

    return await fetch(url, opcoes);
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
