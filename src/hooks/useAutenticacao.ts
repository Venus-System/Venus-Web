import { useContext } from "react";
import { ContextoAutenticacao } from "../contexts/autenticacao";

export function useAutenticacao() {
  const valor = useContext(ContextoAutenticacao);

  if (valor === null) {
    throw new Error(
      "useAutenticacao precisa ser usado dentro de ProvedorAutenticacao.",
    );
  }

  return valor;
}
