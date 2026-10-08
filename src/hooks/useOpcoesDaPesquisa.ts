import { useCallback, useEffect, useState } from "react";
import { buscarOpcoesDaPesquisa } from "../services/pesquisa";
import type { OpcoesDaPesquisa } from "../types/pesquisa";

export type EstadoOpcoesDaPesquisa =
  | { status: "carregando" }
  | { status: "pronto"; opcoes: OpcoesDaPesquisa }
  | { status: "erro"; mensagem: string };

export function useOpcoesDaPesquisa() {
  const [estado, setEstado] = useState<EstadoOpcoesDaPesquisa>({
    status: "carregando",
  });
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let ativo = true;

    setEstado({ status: "carregando" });

    buscarOpcoesDaPesquisa()
      .then((opcoes) => {
        if (ativo) {
          setEstado({ status: "pronto", opcoes });
        }
      })
      .catch((erro: unknown) => {
        if (ativo) {
          setEstado({
            status: "erro",
            mensagem:
              erro instanceof Error
                ? erro.message
                : "Não foi possível carregar as categorias e as marcas.",
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
