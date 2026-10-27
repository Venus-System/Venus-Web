import { useCallback, useEffect, useState } from "react";

export type EstadoDaRequisicao<T> =
  | { status: "carregando" }
  | { status: "pronto"; dados: T }
  | { status: "erro"; mensagem: string };

export function useRequisicao<T>(
  buscar: (sinal: AbortSignal) => Promise<T>,
  mensagemDeErro: string,
  dono: string | null = null,
) {
  const [estado, setEstado] = useState<EstadoDaRequisicao<T>>({
    status: "carregando",
  });
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    const controle = new AbortController();
    let ativo = true;

    setEstado({ status: "carregando" });

    buscar(controle.signal)
      .then((dados) => {
        if (ativo) {
          setEstado({ status: "pronto", dados });
        }
      })
      .catch((erro: unknown) => {
        if (ativo) {
          setEstado({
            status: "erro",
            mensagem: erro instanceof Error ? erro.message : mensagemDeErro,
          });
        }
      });

    return () => {
      ativo = false;
      controle.abort();
    };
  }, [buscar, mensagemDeErro, dono, tentativa]);

  const recarregar = useCallback(() => {
    setTentativa((atual) => atual + 1);
  }, []);

  return { estado, recarregar };
}
