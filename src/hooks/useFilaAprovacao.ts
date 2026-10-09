import { useCallback, useEffect, useState } from "react";
import { listarPendentes } from "../services/admin";
import { ErroSessaoAdminExpirada } from "../services/erros";
import type { CandidatoResumo, OrigemCandidato } from "../types/admin";
import { useAutenticacaoAdmin } from "./useAutenticacaoAdmin";

export type EstadoFila =
  | { status: "carregando" }
  | { status: "pronto"; itens: CandidatoResumo[] }
  | { status: "erro"; mensagem: string };

export function useFilaAprovacao(origem: OrigemCandidato | null) {
  const { sair } = useAutenticacaoAdmin();
  const [estado, setEstado] = useState<EstadoFila>({ status: "carregando" });
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    const controle = new AbortController();
    let ativo = true;

    setEstado({ status: "carregando" });

    listarPendentes({ origin: origem }, controle.signal)
      .then((itens) => {
        if (ativo) {
          setEstado({ status: "pronto", itens });
        }
      })
      .catch((erro: unknown) => {
        if (!ativo) {
          return;
        }

        if (erro instanceof ErroSessaoAdminExpirada) {
          void sair();
          return;
        }

        setEstado({
          status: "erro",
          mensagem:
            erro instanceof Error
              ? erro.message
              : "Não foi possível carregar a fila.",
        });
      });

    return () => {
      ativo = false;
      controle.abort();
    };
  }, [origem, tentativa, sair]);

  const recarregar = useCallback(() => {
    setTentativa((atual) => atual + 1);
  }, []);

  return { estado, recarregar };
}
