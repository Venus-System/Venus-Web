import { useCallback, useEffect, useState } from "react";
import { buscarAnalisePublica } from "../services/analises";
import type { AnaliseExibicao } from "../types/analise";

export type EstadoDaAnalisePublica =
  | { status: "ociosa" }
  | { status: "carregando" }
  | { status: "pronta"; analise: AnaliseExibicao }
  | { status: "erro"; mensagem: string };

export function useAnalisePublica(slug: string | null) {
  const [estado, setEstado] = useState<EstadoDaAnalisePublica>({
    status: "ociosa",
  });
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    if (slug === null) {
      setEstado({ status: "ociosa" });
      return;
    }

    const controle = new AbortController();
    let ativo = true;

    setEstado({ status: "carregando" });

    buscarAnalisePublica(slug, controle.signal)
      .then((analise) => {
        if (ativo) {
          setEstado({ status: "pronta", analise });
        }
      })
      .catch((erro: unknown) => {
        if (ativo) {
          setEstado({
            status: "erro",
            mensagem:
              erro instanceof Error
                ? erro.message
                : "Não foi possível carregar a análise deste produto.",
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

  return { estado, recarregar };
}
