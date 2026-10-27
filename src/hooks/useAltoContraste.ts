import { useState } from "react";
import {
  guardarAltoContraste,
  lerAltoContraste,
} from "../utils/altoContraste";

export function useAltoContraste() {
  const [ativo, setAtivo] = useState(lerAltoContraste);

  function alternar() {
    const novo = !ativo;

    setAtivo(novo);
    guardarAltoContraste(novo);
  }

  return { ativo, alternar };
}
