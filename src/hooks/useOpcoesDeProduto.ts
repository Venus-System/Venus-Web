import { useCallback, useEffect, useState } from "react";
import { buscarProdutos } from "../services/produtos";
import type { Produto } from "../types/produto";

export type EstadoOpcoes =
  | { status: "carregando" }
  | { status: "pronto"; produtos: Produto[] }
  | { status: "erro"; mensagem: string };

const POR_NOME = new Intl.Collator("pt-BR");

export function useOpcoesDeProduto() {
  const [estado, setEstado] = useState<EstadoOpcoes>({ status: "carregando" });
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    const controle = new AbortController();
    let ativo = true;

    setEstado({ status: "carregando" });

    buscarProdutos(undefined, controle.signal)
      .then((produtos) => {
        if (ativo) {
          setEstado({
            status: "pronto",
            produtos: [...produtos].sort((a, b) =>
              POR_NOME.compare(a.name, b.name),
            ),
          });
        }
      })
      .catch((erro: unknown) => {
        if (ativo) {
          setEstado({
            status: "erro",
            mensagem:
              erro instanceof Error
                ? erro.message
                : "Não foi possível carregar os produtos.",
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
