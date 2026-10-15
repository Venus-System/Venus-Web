import { useEffect, useState } from "react";
import { enderecoDeAutorizacao } from "../services/agenda";
import {
  criarPedidoDeConexao,
  enderecoDeVolta,
  guardarPedido,
} from "../utils/conexaoGoogle";

export function useLinkDaAgenda(
  ativo: boolean,
  returnTo: string,
): string | null {
  const [link, setLink] = useState<string | null>(null);

  useEffect(() => {
    if (!ativo) {
      setLink(null);
      return;
    }

    let valido = true;

    criarPedidoDeConexao(returnTo)
      .then((pedido) => {
        if (!valido) {
          return;
        }

        guardarPedido(pedido);
        setLink(enderecoDeAutorizacao(pedido, enderecoDeVolta()));
      })
      .catch(() => {
        if (valido) {
          setLink(null);
        }
      });

    return () => {
      valido = false;
    };
  }, [ativo, returnTo]);

  return link;
}
