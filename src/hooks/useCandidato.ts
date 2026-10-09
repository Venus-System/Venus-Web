import { useEffect, useState } from "react";
import { buscarPendente } from "../services/admin";
import { ErroSessaoAdminExpirada } from "../services/erros";
import type { Candidato } from "../types/admin";
import { useAutenticacaoAdmin } from "./useAutenticacaoAdmin";

export type EstadoCandidato =
  | { status: "nenhum" }
  | { status: "carregando" }
  | { status: "pronto"; candidato: Candidato }
  | { status: "erro"; mensagem: string };

export function useCandidato(id: string | null) {
  const { sair } = useAutenticacaoAdmin();
  const [estado, setEstado] = useState<EstadoCandidato>({ status: "nenhum" });

  useEffect(() => {
    if (id === null) {
      setEstado({ status: "nenhum" });
      return;
    }

    const controle = new AbortController();
    let ativo = true;

    setEstado({ status: "carregando" });

    buscarPendente(id, controle.signal)
      .then((candidato) => {
        if (ativo) {
          setEstado({ status: "pronto", candidato });
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
              : "Não foi possível abrir este produto.",
        });
      });

    return () => {
      ativo = false;
      controle.abort();
    };
  }, [id, sair]);

  return estado;
}
