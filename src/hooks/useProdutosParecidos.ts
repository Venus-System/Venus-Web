import { useEffect, useState } from "react";
import { pesquisarProdutos } from "../services/pesquisa";
import type { Produto } from "../types/produto";

export type EstadoDosParecidos =
  | { status: "ocioso" }
  | { status: "carregando" }
  | { status: "pronto"; produtos: Produto[] }
  | { status: "erro"; mensagem: string };

const PARECIDOS_MOSTRADOS = 3;

export function useProdutosParecidos(nome: string): EstadoDosParecidos {
  const [estado, setEstado] = useState<EstadoDosParecidos>({ status: "ocioso" });

  useEffect(() => {
    const termo = nome.trim();

    if (termo === "") {
      setEstado({ status: "ocioso" });
      return;
    }

    const controle = new AbortController();
    let ativo = true;

    setEstado({ status: "carregando" });

    pesquisarProdutos({ termo, categoria: "", marca: "" }, 0, controle.signal)
      .then((resultado) => {
        if (ativo) {
          setEstado({
            status: "pronto",
            produtos: resultado.produtos.slice(0, PARECIDOS_MOSTRADOS),
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
                : "Não foi possível procurar no catálogo.",
          });
        }
      });

    return () => {
      ativo = false;
      controle.abort();
    };
  }, [nome]);

  return estado;
}
