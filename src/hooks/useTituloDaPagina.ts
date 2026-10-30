import { useEffect } from "react";

const NOME_DO_SITE = "Venus";

export function useTituloDaPagina(titulo: string) {
  useEffect(() => {
    document.title =
      titulo === "" ? NOME_DO_SITE : `${titulo} – ${NOME_DO_SITE}`;
  }, [titulo]);
}
