import { useCallback, useState } from "react";
import { publicarAvaliacao } from "../services/avaliacoes";
import type { NovaAvaliacao } from "../types/avaliacao";

export interface EstadoDaPublicacao {
  enviando: boolean;
  erro: string | null;
  publicada: boolean;
}

const INICIAL: EstadoDaPublicacao = {
  enviando: false,
  erro: null,
  publicada: false,
};

export function usePublicarAvaliacao() {
  const [estado, setEstado] = useState<EstadoDaPublicacao>(INICIAL);

  const publicar = useCallback(
    async (slug: string, nova: NovaAvaliacao): Promise<boolean> => {
      setEstado({ enviando: true, erro: null, publicada: false });

      try {
        await publicarAvaliacao(slug, nova);
        setEstado({ enviando: false, erro: null, publicada: true });

        return true;
      } catch (erro) {
        setEstado({
          enviando: false,
          erro:
            erro instanceof Error
              ? erro.message
              : "Não foi possível publicar a avaliação.",
          publicada: false,
        });

        return false;
      }
    },
    [],
  );

  const limpar = useCallback(() => {
    setEstado(INICIAL);
  }, []);

  return { estado, publicar, limpar };
}
