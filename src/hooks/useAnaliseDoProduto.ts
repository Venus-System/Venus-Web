import { useEffect, useState } from "react";
import { buscarAnalisePublica } from "../services/analises";
import { ErroProdutoNaoEncontrado } from "../services/erros";
import type { AnaliseExibicao } from "../types/analise";

export type EstadoDoProduto =
  | { situacao: "carregando" }
  | { situacao: "sucesso"; analise: AnaliseExibicao }
  | { situacao: "nao-encontrado" }
  | { situacao: "erro"; mensagem: string };

const TEMPO_LIMITE = 8000;

export function useAnaliseDoProduto(slug: string | undefined): EstadoDoProduto {
  const [estado, setEstado] = useState<EstadoDoProduto>({
    situacao: "carregando",
  });

  useEffect(() => {
    if (!slug) {
      return;
    }

    const controle = new AbortController();
    let ativo = true;
    let expirou = false;
    const limite = setTimeout(() => {
      expirou = true;
      controle.abort();
    }, TEMPO_LIMITE);

    async function carregar(slugAtual: string) {
      setEstado({ situacao: "carregando" });

      try {
        const analise = await buscarAnalisePublica(slugAtual, controle.signal);

        if (ativo) {
          setEstado({ situacao: "sucesso", analise });
        }
      } catch (erro) {
        if (!ativo) {
          return;
        }

        if (erro instanceof ErroProdutoNaoEncontrado) {
          setEstado({ situacao: "nao-encontrado" });
          return;
        }

        if (erro instanceof DOMException && erro.name === "AbortError") {
          if (expirou) {
            setEstado({
              situacao: "erro",
              mensagem: "A busca demorou demais. Tente novamente",
            });
          }

          return;
        }

        setEstado({
          situacao: "erro",
          mensagem: "Não foi possível carregar este produto.",
        });
      }
    }

    void carregar(slug);

    return () => {
      ativo = false;
      clearTimeout(limite);
      controle.abort();
    };
  }, [slug]);

  return estado;
}
