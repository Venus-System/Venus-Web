import { useEffect, useState } from "react";
import {
  agendaDisponivel,
  desconectarAgenda,
  lerConexaoDaAgenda,
} from "../services/agenda";
import type {
  EstadoDaConexao,
  EstadoDaDesconexao,
} from "../types/agenda";

interface EstadoDaAgenda {
  conexao: EstadoDaConexao;
  desconexao: EstadoDaDesconexao;
  tentativa: number;
}

const INICIAL: EstadoDaAgenda = {
  conexao: { status: "carregando" },
  desconexao: { status: "ociosa" },
  tentativa: 0,
};

function mensagemDe(erro: unknown, padrao: string): string {
  return erro instanceof Error ? erro.message : padrao;
}

export function useAgendaGoogle(ativa: boolean) {
  const [estado, setEstado] = useState<EstadoDaAgenda>(INICIAL);
  const disponivel = ativa && agendaDisponivel();

  useEffect(() => {
    if (!disponivel) {
      return;
    }

    let valido = true;

    setEstado((atual) => ({ ...atual, conexao: { status: "carregando" } }));

    lerConexaoDaAgenda()
      .then((conexao) => {
        if (valido) {
          setEstado((atual) => ({
            ...atual,
            conexao: { status: "pronta", conectada: conexao.connected },
          }));
        }
      })
      .catch((erro: unknown) => {
        if (valido) {
          setEstado((atual) => ({
            ...atual,
            conexao: {
              status: "erro",
              mensagem: mensagemDe(
                erro,
                "Não foi possível ver se a sua agenda está conectada.",
              ),
            },
          }));
        }
      });

    return () => {
      valido = false;
    };
  }, [disponivel, estado.tentativa]);

  function recarregar() {
    setEstado((atual) => ({ ...atual, tentativa: atual.tentativa + 1 }));
  }

  function desconectar() {
    if (estado.desconexao.status === "desconectando") {
      return;
    }

    setEstado((atual) => ({
      ...atual,
      desconexao: { status: "desconectando" },
    }));

    desconectarAgenda()
      .then(() => {
        setEstado((atual) => ({
          ...atual,
          conexao: { status: "pronta", conectada: false },
          desconexao: { status: "ociosa" },
        }));
      })
      .catch((erro: unknown) => {
        setEstado((atual) => ({
          ...atual,
          desconexao: {
            status: "erro",
            mensagem: mensagemDe(
              erro,
              "Não foi possível desconectar a sua agenda.",
            ),
          },
        }));
      });
  }

  return {
    disponivel,
    conexao: estado.conexao,
    desconexao: estado.desconexao,
    recarregar,
    desconectar,
  };
}
