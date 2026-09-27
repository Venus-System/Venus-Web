import { useContext } from "react";
import { ContextoAutenticacaoAdmin } from "../contexts/autenticacaoAdmin";

export function useAutenticacaoAdmin() {
  const valor = useContext(ContextoAutenticacaoAdmin);

  if (valor === null) {
    throw new Error(
      "useAutenticacaoAdmin precisa ser usado dentro de ProvedorAutenticacaoAdmin.",
    );
  }

  return valor;
}
