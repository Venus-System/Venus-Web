import { useCallback, useEffect, useState } from "react";
import {
  buscarFavoritos,
  desfavoritar,
  favoritar,
} from "../services/favoritos";
import type { Produto } from "../types/produto";

export interface ProdutoFavoritavel {
  slug: string;
  name: string;
}

export interface AcaoDeFavorito {
  nome: string;
  favoritado: boolean;
}

export type EstadoFavoritos =
  | { status: "carregando" }
  | { status: "erro"; mensagem: string }
  | {
      status: "pronto";
      produtos: Produto[];
      slugs: string[];
      pendentes: string[];
      erroAoAlternar: string | null;
      ultimaAcao: AcaoDeFavorito | null;
    };

function mensagemDoErro(erro: unknown, padrao: string): string {
  return erro instanceof Error ? erro.message : padrao;
}

export function useFavoritos() {
  const [estado, setEstado] = useState<EstadoFavoritos>({
    status: "carregando",
  });
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    const controle = new AbortController();
    let ativo = true;

    setEstado({ status: "carregando" });

    buscarFavoritos(controle.signal)
      .then((produtos) => {
        if (ativo) {
          setEstado({
            status: "pronto",
            produtos,
            slugs: produtos.map((produto) => produto.slug),
            pendentes: [],
            erroAoAlternar: null,
            ultimaAcao: null,
          });
        }
      })
      .catch((erro: unknown) => {
        if (ativo) {
          setEstado({
            status: "erro",
            mensagem: mensagemDoErro(
              erro,
              "Não foi possível carregar os seus favoritos.",
            ),
          });
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

  const alternar = useCallback(
    (produto: ProdutoFavoritavel) => {
      if (
        estado.status !== "pronto" ||
        estado.pendentes.includes(produto.slug)
      ) {
        return;
      }

      const eraFavorito = estado.slugs.includes(produto.slug);
      const acao = eraFavorito ? desfavoritar : favoritar;

      setEstado((atual) =>
        atual.status !== "pronto"
          ? atual
          : {
              ...atual,
              pendentes: [...atual.pendentes, produto.slug],
              erroAoAlternar: null,
            },
      );

      acao(produto.slug)
        .then(() => {
          setEstado((atual) =>
            atual.status !== "pronto"
              ? atual
              : {
                  ...atual,
                  slugs: eraFavorito
                    ? atual.slugs.filter((slug) => slug !== produto.slug)
                    : [...atual.slugs, produto.slug],
                  produtos: eraFavorito
                    ? atual.produtos.filter(
                        (item) => item.slug !== produto.slug,
                      )
                    : atual.produtos,
                  pendentes: atual.pendentes.filter(
                    (slug) => slug !== produto.slug,
                  ),
                  ultimaAcao: { nome: produto.name, favoritado: !eraFavorito },
                },
          );
        })
        .catch((erro: unknown) => {
          setEstado((atual) =>
            atual.status !== "pronto"
              ? atual
              : {
                  ...atual,
                  pendentes: atual.pendentes.filter(
                    (slug) => slug !== produto.slug,
                  ),
                  erroAoAlternar: mensagemDoErro(
                    erro,
                    "Não foi possível atualizar os seus favoritos.",
                  ),
                },
          );
        });
    },
    [estado],
  );

  return { estado, recarregar, alternar };
}
