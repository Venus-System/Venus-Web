import { useCallback, useEffect, useState } from "react";
import { buscarAvaliacoes } from "../services/avaliacoes";
import type { AvaliacoesDoProduto } from "../types/avaliacao";
import { useAutenticacao } from "./useAutenticacao";

export type EstadoAvaliacoes =
  | { status: "carregando" }
  | {
      status: "pronto";
      slug: string;
      avaliacoes: AvaliacoesDoProduto;
      rodada: number;
    }
  | { status: "erro"; mensagem: string };

export function useAvaliacoes(slug: string | null) {
  const { usuario } = useAutenticacao();
  const dono = usuario === null ? null : usuario.id;
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
          setEstado({ status: "pronto", slug, avaliacoes, rodada: 0 });
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
  }, [slug, tentativa, dono]);

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
          atual.status !== "pronto" || atual.slug !== slug
            ? atual
            : { ...atual, avaliacoes, rodada: atual.rodada + 1 },
        );
      })
      .catch(() => undefined);
  }, [slug]);

  return { estado, recarregar, atualizar };
}
