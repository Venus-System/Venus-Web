import { useCallback, useEffect, useState } from "react";
import { buscarHistorico } from "../services/historico";
import { useAutenticacao } from "./useAutenticacao";
import type { AnaliseRecente } from "../types/painel";
import { umaPorDia } from "../utils/umaPorDia";

export type EstadoHistorico =
  | { status: "carregando" }
  | { status: "erro"; mensagem: string }
  | {
      status: "pronto";
      analises: AnaliseRecente[];
      temMais: boolean;
      proximaPagina: number;
      carregandoMais: boolean;
      erroAoCarregarMais: string | null;
      recemCarregadas: number | null;
    };

function semRepeticaoNoDia(analises: AnaliseRecente[]): AnaliseRecente[] {
  return umaPorDia(
    analises,
    (analise) => analise.product.slug,
    (analise) => analise.analyzedAt,
  );
}

function mensagemDoErro(erro: unknown): string {
  return erro instanceof Error
    ? erro.message
    : "Não foi possível carregar o seu histórico.";
}

export function useHistorico() {
  const { usuario } = useAutenticacao();
  const dono = usuario === null ? null : usuario.id;
  const [estado, setEstado] = useState<EstadoHistorico>({
    status: "carregando",
  });
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    const controle = new AbortController();
    let ativo = true;

    setEstado({ status: "carregando" });

    buscarHistorico(0, controle.signal)
      .then((pagina) => {
        if (ativo) {
          setEstado({
            status: "pronto",
            analises: semRepeticaoNoDia(pagina.items),
            temMais: pagina.hasMore,
            proximaPagina: 1,
            carregandoMais: false,
            erroAoCarregarMais: null,
            recemCarregadas: null,
          });
        }
      })
      .catch((erro: unknown) => {
        if (ativo) {
          setEstado({ status: "erro", mensagem: mensagemDoErro(erro) });
        }
      });

    return () => {
      ativo = false;
      controle.abort();
    };
  }, [tentativa, dono]);

  const recarregar = useCallback(() => {
    setTentativa((atual) => atual + 1);
  }, []);

  const carregarMais = useCallback(() => {
    if (
      estado.status !== "pronto" ||
      estado.carregandoMais ||
      !estado.temMais
    ) {
      return;
    }

    const pagina = estado.proximaPagina;

    setEstado({ ...estado, carregandoMais: true, erroAoCarregarMais: null });

    buscarHistorico(pagina)
      .then((resultado) => {
        setEstado((atual) => {
          if (atual.status !== "pronto") {
            return atual;
          }

          const juntas = semRepeticaoNoDia([
            ...atual.analises,
            ...resultado.items,
          ]);

          return {
            ...atual,
            analises: juntas,
            temMais: resultado.hasMore,
            proximaPagina: pagina + 1,
            carregandoMais: false,
            recemCarregadas: juntas.length - atual.analises.length,
          };
        });
      })
      .catch((erro: unknown) => {
        setEstado((atual) =>
          atual.status !== "pronto"
            ? atual
            : {
                ...atual,
                carregandoMais: false,
                erroAoCarregarMais: mensagemDoErro(erro),
              },
        );
      });
  }, [estado]);

  return { estado, recarregar, carregarMais };
}
