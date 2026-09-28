import { useCallback, useEffect, useState } from "react";
import { buscarCatalogoDaRevisao } from "../services/admin";
import type { CatalogoDaRevisao } from "../types/admin";

export type EstadoCatalogo =
  | { status: "carregando" }
  | { status: "pronto"; catalogo: CatalogoDaRevisao }
  | { status: "erro"; mensagem: string };

export function useCatalogoDaRevisao() {
  const [estado, setEstado] = useState<EstadoCatalogo>({
    status: "carregando",
  });
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    const controle = new AbortController();
    let ativo = true;

    setEstado({ status: "carregando" });

    buscarCatalogoDaRevisao(controle.signal)
      .then((catalogo) => {
        if (ativo) {
          setEstado({ status: "pronto", catalogo });
        }
      })
      .catch((erro: unknown) => {
        if (ativo) {
          setEstado({
            status: "erro",
            mensagem:
              erro instanceof Error
                ? erro.message
                : "Não foi possível carregar as marcas e categorias.",
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
