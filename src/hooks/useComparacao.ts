import { useCallback, useEffect, useState } from "react";
import { buscarComparacao } from "../services/comparacao";
import type { ProdutoComparado } from "../types/comparacao";

export type EstadoComparacao =
  | { status: "incompleta" }
  | { status: "carregando" }
  | { status: "pronta"; produtos: [ProdutoComparado, ProdutoComparado] }
  | { status: "erro"; mensagem: string };

export function useComparacao(slugA: string | null, slugB: string | null) {
  const [estado, setEstado] = useState<EstadoComparacao>({
    status: "incompleta",
  });
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    if (slugA === null || slugB === null || slugA === slugB) {
      setEstado({ status: "incompleta" });
      return;
    }

    const controle = new AbortController();
    let ativo = true;

    setEstado({ status: "carregando" });

    buscarComparacao(slugA, slugB, controle.signal)
      .then((produtos) => {
        if (ativo) {
          setEstado({ status: "pronta", produtos });
        }
      })
      .catch((erro: unknown) => {
        if (ativo) {
          setEstado({
            status: "erro",
            mensagem:
              erro instanceof Error
                ? erro.message
                : "Não foi possível carregar a comparação.",
          });
        }
      });

    return () => {
      ativo = false;
      controle.abort();
    };
  }, [slugA, slugB, tentativa]);

  const recarregar = useCallback(() => {
    setTentativa((atual) => atual + 1);
  }, []);

  return { estado, recarregar };
}
