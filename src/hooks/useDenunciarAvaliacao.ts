import { useCallback, useState } from "react";
import { denunciarAvaliacao } from "../services/avaliacoes";
import type { Denuncia } from "../types/avaliacao";

export interface EstadoDaDenuncia {
  enviando: boolean;
  erro: string | null;
  enviada: boolean;
}

const INICIAL: EstadoDaDenuncia = {
  enviando: false,
  erro: null,
  enviada: false,
};

export function useDenunciarAvaliacao() {
  const [estado, setEstado] = useState<EstadoDaDenuncia>(INICIAL);

  const denunciar = useCallback(
    async (avaliacaoId: string, denuncia: Denuncia): Promise<boolean> => {
      setEstado({ enviando: true, erro: null, enviada: false });

      try {
        await denunciarAvaliacao(avaliacaoId, denuncia);
        setEstado({ enviando: false, erro: null, enviada: true });

        return true;
      } catch (erro) {
        setEstado({
          enviando: false,
          erro:
            erro instanceof Error
              ? erro.message
              : "Não foi possível enviar a denúncia.",
          enviada: false,
        });

        return false;
      }
    },
    [],
  );

  const limpar = useCallback(() => {
    setEstado(INICIAL);
  }, []);

  return { estado, denunciar, limpar };
}
