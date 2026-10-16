import type { PedidoDeConexao } from "../types/agenda";

export const CAMINHO_DE_VOLTA = "/integracoes/google-agenda";

const CHAVE_DO_PEDIDO = "venus.conexaoGoogle";
const BYTES_DO_VERIFICADOR = 48;
const BYTES_DO_STATE = 16;

function base64Url(bytes: Uint8Array): string {
  let binario = "";

  bytes.forEach((byte) => {
    binario += String.fromCharCode(byte);
  });

  return btoa(binario)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function aleatorio(tamanho: number): string {
  const bytes = new Uint8Array(tamanho);

  crypto.getRandomValues(bytes);

  return base64Url(bytes);
}

export function enderecoDeVolta(): string {
  return `${window.location.origin}${CAMINHO_DE_VOLTA}`;
}

export async function criarPedidoDeConexao(
  returnTo: string,
  ownerId: string,
): Promise<PedidoDeConexao> {
  const codeVerifier = aleatorio(BYTES_DO_VERIFICADOR);
  const resumo = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(codeVerifier),
  );

  return {
    state: aleatorio(BYTES_DO_STATE),
    codeVerifier,
    codeChallenge: base64Url(new Uint8Array(resumo)),
    returnTo,
    ownerId,
  };
}

function ehPedido(valor: unknown): valor is PedidoDeConexao {
  return (
    typeof valor === "object" &&
    valor !== null &&
    "state" in valor &&
    typeof valor.state === "string" &&
    "codeVerifier" in valor &&
    typeof valor.codeVerifier === "string" &&
    "codeChallenge" in valor &&
    typeof valor.codeChallenge === "string" &&
    "returnTo" in valor &&
    typeof valor.returnTo === "string" &&
    "ownerId" in valor &&
    typeof valor.ownerId === "string"
  );
}

export function guardarPedido(pedido: PedidoDeConexao): boolean {
  try {
    sessionStorage.setItem(CHAVE_DO_PEDIDO, JSON.stringify(pedido));
    return true;
  } catch {
    return false;
  }
}

export function lerPedido(): PedidoDeConexao | null {
  try {
    const bruto = sessionStorage.getItem(CHAVE_DO_PEDIDO);
    const valor: unknown = bruto === null ? null : JSON.parse(bruto);

    return ehPedido(valor) ? valor : null;
  } catch {
    return null;
  }
}

export function limparPedido(): void {
  try {
    sessionStorage.removeItem(CHAVE_DO_PEDIDO);
  } catch {
    return;
  }
}
