import { useEffect, useState } from "react";
import { enderecoDeAutorizacao } from "../services/agenda";
import type { EstadoDoLink } from "../types/agenda";
import {
  criarPedidoDeConexao,
  enderecoDeVolta,
  guardarPedido,
} from "../utils/conexaoGoogle";

export function useLinkDaAgenda(
  ativo: boolean,
  returnTo: string,
  ownerId: string | null,
) {
  const [link, setLink] = useState<EstadoDoLink>({ status: "preparando" });
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    if (!ativo || ownerId === null) {
      setLink({ status: "preparando" });
      return;
    }

    let valido = true;

    setLink({ status: "preparando" });

    criarPedidoDeConexao(returnTo, ownerId)
      .then((pedido) => {
        if (!valido) {
          return;
        }

        setLink(
          guardarPedido(pedido)
            ? {
                status: "pronto",
                url: enderecoDeAutorizacao(pedido, enderecoDeVolta()),
              }
            : { status: "erro" },
        );
      })
      .catch(() => {
        if (valido) {
          setLink({ status: "erro" });
        }
      });

    return () => {
      valido = false;
    };
  }, [ativo, returnTo, ownerId, tentativa]);

  function tentarDeNovo() {
    setTentativa((atual) => atual + 1);
  }

  return { link, tentarDeNovo };
}
