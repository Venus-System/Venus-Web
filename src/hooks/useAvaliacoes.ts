import { useCallback, useEffect, useState } from "react";
import { buscarAvaliacoes } from "../services/avaliacoes";
import type { AvaliacoesDoProduto } from "../types/avaliacao";

export type EstadoAvaliacoes =
  | { status: "carregando" }
  | { status: "pronto"; avaliacoes: AvaliacoesDoProduto; rodada: number }
  | { status: "erro"; mensagem: string };

export function useAvaliacoes(slug: string | null) {
  const [estado, setEstado] = useState<EstadoAvaliacoes>({
    status: "carregando",
  });
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    if (slug === null) {
      return;
    }

    const controle = new AbortController();
    let ativo = true;

    setEstado({ status: "carregando" });

    buscarAvaliacoes(slug, controle.signal)
      .then((avaliacoes) => {
        if (ativo) {
          setEstado({ status: "pronto", avaliacoes, rodada: 0 });
        }
      })
      .catch((erro: unknown) => {
        if (ativo) {
          setEstado({
            status: "erro",
            mensagem:
              erro instanceof Error
                ? erro.message
                : "Não foi possível carregar as avaliações deste produto.",
          });
        }
      });

    return () => {
      ativo = false;
      controle.abort();
    };
  }, [slug, tentativa]);

  const recarregar = useCallback(() => {
    setTentativa((atual) => atual + 1);
  }, []);

  const atualizar = useCallback(() => {
    if (slug === null) {
      return;
    }

    buscarAvaliacoes(slug)
      .then((avaliacoes) => {
        setEstado((atual) =>
          atual.status !== "pronto"
            ? atual
            : { status: "pronto", avaliacoes, rodada: atual.rodada + 1 },
        );
      })
      .catch(() => undefined);
  }, [slug]);

  return { estado, recarregar, atualizar };
}
