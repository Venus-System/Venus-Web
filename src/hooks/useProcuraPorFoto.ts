import { useCallback, useState } from "react";
import { lerTextoDaImagem } from "../services/ocr";
import { buscarProdutos } from "../services/produtos";
import type { TextoLido } from "../types/escanear";
import type { Produto } from "../types/produto";
import {
  procurarPeloTexto,
  temTextoLegivel,
} from "../utils/identificacaoDoProduto";

export interface ImagemLida {
  arquivo: Blob;
  texto: TextoLido;
}

export type BuscaPorFoto =
  | { situacao: "ocioso" }
  | { situacao: "lendo" }
  | { situacao: "procurando"; imagem: ImagemLida }
  | { situacao: "encontrados"; imagem: ImagemLida; produtos: Produto[] }
  | {
      situacao: "nenhum";
      imagem: ImagemLida;
      daMesmaMarca: Produto[];
      parecidos: Produto[];
    }
  | { situacao: "erro"; mensagem: string; imagem: ImagemLida | null };

const OCIOSA: BuscaPorFoto = { situacao: "ocioso" };

const SEM_TEXTO =
  "Não achamos texto nesta imagem. Mande uma foto ou um print em que o nome e a marca do produto apareçam.";

export function useProcuraPorFoto() {
  const [busca, setBusca] = useState<BuscaPorFoto>(OCIOSA);
  const ocupado = busca.situacao === "lendo" || busca.situacao === "procurando";

  const pesquisar = useCallback(
    async (arquivo: Blob) => {
      if (ocupado) {
        return;
      }

      setBusca({ situacao: "lendo" });

      let lida: ImagemLida | null = null;

      try {
        lida = { arquivo, texto: await lerTextoDaImagem(arquivo) };

        if (!temTextoLegivel(lida.texto.lines)) {
          setBusca({ situacao: "erro", mensagem: SEM_TEXTO, imagem: null });
          return;
        }

        const imagemLida = lida;

        setBusca({ situacao: "procurando", imagem: imagemLida });

        const { candidatos, daMesmaMarca, parecidos } = procurarPeloTexto(
          imagemLida.texto.lines,
          await buscarProdutos(),
        );

        setBusca(
          candidatos.length > 0
            ? { situacao: "encontrados", imagem: imagemLida, produtos: candidatos }
            : { situacao: "nenhum", imagem: imagemLida, daMesmaMarca, parecidos },
        );
      } catch (erro) {
        setBusca({
          situacao: "erro",
          mensagem:
            erro instanceof Error
              ? erro.message
              : "Não foi possível procurar o produto agora.",
          imagem: lida,
        });
      }
    },
    [ocupado],
  );

  const falhar = useCallback((mensagem: string) => {
    setBusca({ situacao: "erro", mensagem, imagem: null });
  }, []);

  const recomecar = useCallback(() => {
    setBusca(OCIOSA);
  }, []);

  return { busca, ocupado, pesquisar, falhar, recomecar };
}
