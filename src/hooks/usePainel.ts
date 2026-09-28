import { useCallback, useEffect, useState } from "react";
import { buscarPainel } from "../services/painel";
import type { Painel } from "../types/painel";

export type EstadoPainel =
  | { status: "carregando" }
  | { status: "pronto"; painel: Painel }
  | { status: "erro"; mensagem: string };

export function usePainel() {
  const [estado, setEstado] = useState<EstadoPainel>({ status: "carregando" });
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    const controle = new AbortController();
    let ativo = true;

    setEstado({ status: "carregando" });

    buscarPainel(controle.signal)
      .then((painel) => {
        if (ativo) {
          setEstado({ status: "pronto", painel });
        }
      })
      .catch((erro: unknown) => {
        if (ativo) {
          setEstado({
            status: "erro",
            mensagem:
              erro instanceof Error
                ? erro.message
                : "Não foi possível carregar o seu painel.",
          });
        }
      });

    return () => {
      ativo = false;
      controle.abort();
    };
  }, [tentativa]);

  const recarregar = useCallback(() => {
    setTentativa((atual) => atual + 1);
  }, []);

  return { estado, recarregar };
}
