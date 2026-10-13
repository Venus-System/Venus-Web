import type { MensagemDoChat } from "../types/chat";

export interface ConversaGuardada {
  mensagens: MensagemDoChat[];
  conversationId: string | null;
}

const PREFIXO = "venus.chat.";

function ehMensagem(valor: unknown): valor is MensagemDoChat {
  return (
    typeof valor === "object" &&
    valor !== null &&
    "id" in valor &&
    typeof valor.id === "string" &&
    "author" in valor &&
    (valor.author === "pessoa" || valor.author === "veninha") &&
    "text" in valor &&
    typeof valor.text === "string" &&
    "sentAt" in valor &&
    typeof valor.sentAt === "string"
  );
}

function ehConversa(valor: unknown): valor is ConversaGuardada {
  return (
    typeof valor === "object" &&
    valor !== null &&
    "mensagens" in valor &&
    Array.isArray(valor.mensagens) &&
    valor.mensagens.every(ehMensagem) &&
    "conversationId" in valor &&
    (valor.conversationId === null || typeof valor.conversationId === "string")
  );
}

export function lerConversa(usuarioId: string): ConversaGuardada | null {
  try {
    const bruto = sessionStorage.getItem(`${PREFIXO}${usuarioId}`);

    if (bruto === null) {
      return null;
    }

    const dados: unknown = JSON.parse(bruto);

    return ehConversa(dados) ? dados : null;
  } catch {
    return null;
  }
}

export function guardarConversa(
  usuarioId: string,
  conversa: ConversaGuardada,
): void {
  try {
    sessionStorage.setItem(`${PREFIXO}${usuarioId}`, JSON.stringify(conversa));
  } catch {
    return;
  }
}

export function apagarConversa(usuarioId: string): void {
  try {
    sessionStorage.removeItem(`${PREFIXO}${usuarioId}`);
  } catch {
    return;
  }
}
