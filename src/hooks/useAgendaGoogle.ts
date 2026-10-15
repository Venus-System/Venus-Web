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
import {
  conviteFechado,
  guardarConviteFechado,
} from "../utils/conviteDaAgenda";

interface EstadoDaAgenda {
  conexao: EstadoDaConexao;
  desconexao: EstadoDaDesconexao;
  tentativa: number;
  conviteFechado: boolean;
}

const INICIAL: EstadoDaAgenda = {
  conexao: { status: "carregando" },
  desconexao: { status: "ociosa" },
  tentativa: 0,
  conviteFechado: false,
};

function mensagemDe(erro: unknown, padrao: string): string {
  return erro instanceof Error ? erro.message : padrao;
}

export function useAgendaGoogle(usuarioId: string | null, ativa: boolean) {
  const [estado, setEstado] = useState<EstadoDaAgenda>(INICIAL);
  const disponivel = usuarioId !== null && ativa && agendaDisponivel();

  useEffect(() => {
    setEstado((atual) => ({
      ...atual,
      conviteFechado: usuarioId === null ? false : conviteFechado(usuarioId),
    }));
  }, [usuarioId]);

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

  function fecharConvite() {
    if (usuarioId === null) {
      return;
    }

    guardarConviteFechado(usuarioId);
    setEstado((atual) => ({ ...atual, conviteFechado: true }));
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
    conviteFechado: estado.conviteFechado,
    recarregar,
    fecharConvite,
    desconectar,
  };
}
