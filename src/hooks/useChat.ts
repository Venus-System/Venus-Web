import { useContext } from "react";
import { ContextoChat } from "../contexts/chat";

export function useChat() {
  const valor = useContext(ContextoChat);

  if (valor === null) {
    throw new Error("useChat precisa ser usado dentro de ProvedorChat.");
  }

  return valor;
}
