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

export function useAvaliacoes(slug: string | null, versaoId: number | null) {
  const { usuario, carregando: carregandoConta } = useAutenticacao();
  const dono = usuario === null ? null : usuario.id;
  const [estado, setEstado] = useState<EstadoAvaliacoes>({
    status: "carregando",
  });
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    setEstado({ status: "carregando" });

    if (slug === null || carregandoConta) {
      return;
    }

    const controle = new AbortController();
    let ativo = true;

    buscarAvaliacoes(slug, versaoId, controle.signal)
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
  }, [slug, versaoId, tentativa, dono, carregandoConta]);

  const recarregar = useCallback(() => {
    setTentativa((atual) => atual + 1);
  }, []);

  const atualizar = useCallback(async (): Promise<boolean> => {
    if (slug === null) {
      return false;
    }

    try {
      const avaliacoes = await buscarAvaliacoes(slug, versaoId);

      setEstado((atual) =>
        atual.status !== "pronto" || atual.slug !== slug
          ? atual
          : { ...atual, avaliacoes, rodada: atual.rodada + 1 },
      );

      return true;
    } catch {
      return false;
    }
  }, [slug, versaoId]);

  return { estado, recarregar, atualizar };
}
