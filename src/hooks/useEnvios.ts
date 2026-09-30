import { useCallback, useEffect, useState } from "react";
import { buscarEnvios } from "../services/envios";
import type { Envios } from "../types/envio";

export type EstadoEnvios =
  | { status: "carregando" }
  | { status: "pronto"; envios: Envios }
  | { status: "erro"; mensagem: string };

export function useEnvios() {
  const [estado, setEstado] = useState<EstadoEnvios>({ status: "carregando" });
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let ativo = true;

    setEstado({ status: "carregando" });

    buscarEnvios()
      .then((envios) => {
        if (ativo) {
          setEstado({ status: "pronto", envios });
        }
      })
      .catch((erro: unknown) => {
        if (ativo) {
          setEstado({
            status: "erro",
            mensagem:
              erro instanceof Error
                ? erro.message
                : "Não foi possível carregar os seus envios.",
          });
        }
      });

    return () => {
      ativo = false;
    };
  }, [tentativa]);

  const recarregar = useCallback(() => {
    setTentativa((atual) => atual + 1);
  }, []);

  return { estado, recarregar };
}
