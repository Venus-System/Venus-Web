import { useCallback, useEffect, useState } from "react";
import {
  buscarAnalisePessoal,
  recalcularAnalisePessoal,
} from "../services/classificacao";
import type { AnalisePersonalizada, AnalisePessoal } from "../types/analise";
import { useAutenticacao } from "./useAutenticacao";

type Recalculo = "ocioso" | "calculando" | "erro";

export type EstadoDaAnalisePessoal =
  | { status: "sem-conta" }
  | { status: "calculando" }
  | { status: "pronta"; analise: AnalisePersonalizada; recalculo: Recalculo }
  | { status: "sem-perfil" }
  | { status: "indisponivel"; mensagem: string }
  | { status: "erro"; mensagem: string };

const FALHA = "Não foi possível calcular a análise para o seu perfil.";

function paraEstado(resultado: AnalisePessoal): EstadoDaAnalisePessoal {
  switch (resultado.situacao) {
    case "pronta":
      return { status: "pronta", analise: resultado.analise, recalculo: "ocioso" };
    case "sem-perfil":
      return { status: "sem-perfil" };
    case "indisponivel":
      return { status: "indisponivel", mensagem: resultado.mensagem };
  }
}

export function useAnalisePessoal(slug: string | null, versaoId: number | null) {
  const { usuario, carregando } = useAutenticacao();
  const usuarioId = usuario?.id ?? null;
  const [estado, setEstado] = useState<EstadoDaAnalisePessoal>({
    status: "sem-conta",
  });
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    if (carregando) {
      setEstado({ status: "calculando" });
      return;
    }

    if (slug === null || usuarioId === null) {
      setEstado({ status: "sem-conta" });
      return;
    }

    const controle = new AbortController();
    let ativo = true;

    setEstado({ status: "calculando" });

    buscarAnalisePessoal(slug, versaoId, controle.signal)
      .then((resultado) => {
        if (ativo) {
          setEstado(paraEstado(resultado));
        }
      })
      .catch((erro: unknown) => {
        if (ativo) {
          setEstado({
            status: "erro",
            mensagem: erro instanceof Error ? erro.message : FALHA,
          });
        }
      });

    return () => {
      ativo = false;
      controle.abort();
    };
  }, [slug, versaoId, usuarioId, carregando, tentativa]);

  const tentarDeNovo = useCallback(() => {
    setTentativa((atual) => atual + 1);
  }, []);

  const recalcular = useCallback(() => {
    if (slug === null) {
      return;
    }

    setEstado((atual) =>
      atual.status === "pronta" ? { ...atual, recalculo: "calculando" } : atual,
    );

    recalcularAnalisePessoal(slug, versaoId)
      .then((resultado) => {
        setEstado(paraEstado(resultado));
      })
      .catch(() => {
        setEstado((atual) =>
          atual.status === "pronta" ? { ...atual, recalculo: "erro" } : atual,
        );
      });
  }, [slug, versaoId]);

  return { estado, tentarDeNovo, recalcular };
}
