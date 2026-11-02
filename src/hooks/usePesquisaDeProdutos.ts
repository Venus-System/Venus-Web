import { useEffect, useState } from "react";
import { pesquisarProdutos } from "../services/pesquisa";
import type { FiltrosDaPesquisa } from "../types/pesquisa";
import type { Produto } from "../types/produto";

interface ListaCarregada {
  lista: Produto[];
  temMais: boolean;
  paginasCarregadas: number;
}

export type EstadoDaPesquisa =
  | ({ situacao: "carregando" } & ListaCarregada)
  | ({ situacao: "sucesso" } & ListaCarregada)
  | ({ situacao: "erro"; mensagem: string } & ListaCarregada);

export interface BuscaDaPesquisa {
  filtros: FiltrosDaPesquisa;
  pagina: number;
}

const TEMPO_LIMITE = 8000;

export function usePesquisaDeProdutos(busca: BuscaDaPesquisa): EstadoDaPesquisa {
  const [estado, setEstado] = useState<EstadoDaPesquisa>({
    situacao: "carregando",
    lista: [],
    temMais: false,
    paginasCarregadas: 0,
  });

  useEffect(() => {
    let ativo = true;
    let expirou = false;

    const controle = new AbortController();
    const limite = setTimeout(() => {
      expirou = true;
      controle.abort();
    }, TEMPO_LIMITE);

    async function carregar() {
      setEstado((atual) => ({
        situacao: "carregando",
        lista: atual.lista,
        temMais: atual.temMais,
        paginasCarregadas: atual.paginasCarregadas,
      }));

      try {
        const resultado = await pesquisarProdutos(
          busca.filtros,
          busca.pagina,
          controle.signal,
        );

        if (ativo) {
          setEstado((atual) =>
            busca.pagina === 0
              ? {
                  situacao: "sucesso",
                  lista: resultado.produtos,
                  temMais: resultado.temMais,
                  paginasCarregadas: 1,
                }
              : {
                  situacao: "sucesso",
                  lista: [...atual.lista, ...resultado.produtos],
                  temMais: resultado.temMais,
                  paginasCarregadas: atual.paginasCarregadas + 1,
                },
          );
        }
      } catch {
        if (ativo) {
          setEstado((atual) => ({
            situacao: "erro",
            mensagem: expirou
              ? "A busca demorou demais. Tente novamente."
              : "Não foi possível carregar os produtos.",
            lista: atual.lista,
            temMais: busca.pagina === 0 ? false : atual.temMais,
            paginasCarregadas: atual.paginasCarregadas,
          }));
        }
      }
    }

    void carregar();

    return () => {
      ativo = false;
      clearTimeout(limite);
      controle.abort();
    };
  }, [busca]);

  return estado;
}
