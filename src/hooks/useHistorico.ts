import { useCallback, useEffect, useState } from "react";
import { buscarHistorico } from "../services/historico";
import type { AnaliseRecente } from "../types/painel";

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

function mensagemDoErro(erro: unknown): string {
  return erro instanceof Error
    ? erro.message
    : "Não foi possível carregar o seu histórico.";
}

export function useHistorico() {
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
            analises: pagina.items,
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
  }, [tentativa]);

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
        setEstado((atual) =>
          atual.status !== "pronto"
            ? atual
            : {
                ...atual,
                analises: [...atual.analises, ...resultado.items],
                temMais: resultado.hasMore,
                proximaPagina: pagina + 1,
                carregandoMais: false,
                recemCarregadas: resultado.items.length,
              },
        );
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
