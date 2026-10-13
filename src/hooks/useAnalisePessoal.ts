import { useCallback, useEffect, useState } from "react";
import {
  buscarAnalisePessoal,
  recalcularAnalisePessoal,
} from "../services/classificacao";
import type { AnalisePersonalizada, AnalisePessoal } from "../types/analise";
import { useAutenticacao } from "./useAutenticacao";

type Recalculo = "ocioso" | "calculando" | "erro";

export type EstadoDaAnalisePessoal =
  | { status: "sem-produto" }
  | { status: "sem-conta" }
  | { status: "calculando" }
  | { status: "pronta"; analise: AnalisePersonalizada; recalculo: Recalculo }
  | { status: "sem-perfil" }
  | { status: "indisponivel"; mensagem: string }
  | { status: "erro"; mensagem: string };

interface ResultadoGuardado {
  chave: string;
  estado: EstadoDaAnalisePessoal;
}

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

function comRecalculo(
  guardado: ResultadoGuardado | null,
  chave: string,
  recalculo: Recalculo,
): ResultadoGuardado | null {
  if (
    guardado === null ||
    guardado.chave !== chave ||
    guardado.estado.status !== "pronta"
  ) {
    return guardado;
  }

  return { chave, estado: { ...guardado.estado, recalculo } };
}

export function useAnalisePessoal(slug: string | null, versaoId: number | null) {
  const { usuario, carregando } = useAutenticacao();
  const usuarioId = usuario?.id ?? null;
  const chave =
    slug === null || usuarioId === null
      ? null
      : `${usuarioId}|${slug}|${versaoId ?? "sem-versao"}`;
  const [guardado, setGuardado] = useState<ResultadoGuardado | null>(null);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    if (chave === null || slug === null) {
      return;
    }

    let ativo = true;

    buscarAnalisePessoal(slug, versaoId)
      .then((resultado) => {
        if (ativo) {
          setGuardado({ chave, estado: paraEstado(resultado) });
        }
      })
      .catch((erro: unknown) => {
        if (ativo) {
          setGuardado({
            chave,
            estado: {
              status: "erro",
              mensagem: erro instanceof Error ? erro.message : FALHA,
            },
          });
        }
      });

    return () => {
      ativo = false;
    };
  }, [chave, slug, versaoId, tentativa]);

  const tentarDeNovo = useCallback(() => {
    setGuardado(null);
    setTentativa((atual) => atual + 1);
  }, []);

  const recalcular = useCallback(() => {
    if (chave === null || slug === null) {
      return;
    }

    setGuardado((atual) => comRecalculo(atual, chave, "calculando"));

    recalcularAnalisePessoal(slug, versaoId)
      .then((resultado) => {
        setGuardado((atual) =>
          atual !== null && atual.chave === chave
            ? { chave, estado: paraEstado(resultado) }
            : atual,
        );
      })
      .catch(() => {
        setGuardado((atual) => comRecalculo(atual, chave, "erro"));
      });
  }, [chave, slug, versaoId]);

  let estado: EstadoDaAnalisePessoal = { status: "calculando" };

  if (!carregando && usuarioId === null) {
    estado = { status: "sem-conta" };
  } else if (!carregando && chave === null) {
    estado = { status: "sem-produto" };
  } else if (guardado !== null && guardado.chave === chave) {
    estado = guardado.estado;
  }

  return { estado, tentarDeNovo, recalcular };
}
