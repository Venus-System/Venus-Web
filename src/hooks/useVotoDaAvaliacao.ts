import { useCallback, useEffect, useState } from "react";
import { buscarMeuVoto, votar } from "../services/avaliacoes";
import type { Avaliacao, VotoDeAvaliacao } from "../types/avaliacao";

export interface EstadoDoVoto {
  meuVoto: VotoDeAvaliacao | null;
  contagem: number;
  carregando: boolean;
  enviando: boolean;
  erro: string | null;
}

function pontoUtil(voto: VotoDeAvaliacao | null): number {
  return voto === "useful" ? 1 : 0;
}

export function useVotoDaAvaliacao(avaliacao: Avaliacao, podeVotar: boolean) {
  const [estado, setEstado] = useState<EstadoDoVoto>({
    meuVoto: null,
    contagem: avaliacao.usefulCount,
    carregando: podeVotar,
    enviando: false,
    erro: null,
  });

  useEffect(() => {
    if (!podeVotar) {
      setEstado((atual) => ({ ...atual, meuVoto: null, carregando: false }));
      return;
    }

    const controle = new AbortController();
    let ativo = true;

    setEstado((atual) => ({ ...atual, carregando: true }));

    buscarMeuVoto(avaliacao.id, controle.signal)
      .then((meuVoto) => {
        if (ativo) {
          setEstado((atual) => ({ ...atual, meuVoto, carregando: false }));
        }
      })
      .catch(() => {
        if (ativo) {
          setEstado((atual) => ({ ...atual, carregando: false }));
        }
      });

    return () => {
      ativo = false;
      controle.abort();
    };
  }, [avaliacao.id, podeVotar]);

  const escolher = useCallback(
    (escolha: VotoDeAvaliacao) => {
      if (estado.carregando || estado.enviando) {
        return;
      }

      const anterior = estado.meuVoto;
      const novo = anterior === escolha ? null : escolha;

      setEstado((atual) => ({ ...atual, enviando: true, erro: null }));

      votar(avaliacao.id, novo, anterior)
        .then(() => {
          setEstado((atual) => ({
            ...atual,
            meuVoto: novo,
            contagem: atual.contagem - pontoUtil(anterior) + pontoUtil(novo),
            enviando: false,
          }));
        })
        .catch((erro: unknown) => {
          setEstado((atual) => ({
            ...atual,
            enviando: false,
            erro:
              erro instanceof Error
                ? erro.message
                : "Não foi possível registrar o seu voto.",
          }));
        });
    },
    [avaliacao.id, estado.carregando, estado.enviando, estado.meuVoto],
  );

  return { estado, escolher };
}
