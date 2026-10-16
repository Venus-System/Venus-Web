import { useState } from "react";
import type { IngredienteACriar } from "../components/ModalAprovacao";
import {
  aprovarPendente,
  calcularNotaBase,
  recusarPendente,
  sincronizarPendente,
} from "../services/admin";
import {
  ErroCandidatoNaoEncontrado,
  ErroRevisaoEmConflito,
  ErroRevisaoInvalida,
  ErroSessaoAdminExpirada,
} from "../services/erros";
import type {
  AprovacaoCandidato,
  Candidato,
  RecusaCandidato,
} from "../types/admin";

type ModalAberto = "nenhum" | "aprovar" | "recusar";

export type PedidoDeDecisao =
  | { tipo: "aprovar"; aprovacao: AprovacaoCandidato }
  | { tipo: "recusar"; recusa: RecusaCandidato };

interface EstadoDecisao {
  modal: ModalAberto;
  aprovacao: AprovacaoCandidato | null;
  enviando: boolean;
  mensagem: string;
  detalhes: string[];
  anuncio: string;
  semSincronizar: string | null;
}

interface OpcoesDaDecisao {
  recarregar: () => void;
  aoAvancar: (idAtual: string) => void;
  aoExpirar: () => void;
}

const SEM_DECISAO: EstadoDecisao = {
  modal: "nenhum",
  aprovacao: null,
  enviando: false,
  mensagem: "",
  detalhes: [],
  anuncio: "",
  semSincronizar: null,
};

export function novosDaAprovacao(
  aprovacao: AprovacaoCandidato | null,
): IngredienteACriar[] {
  if (aprovacao === null) {
    return [];
  }

  return aprovacao.ingredients.flatMap((decisao) =>
    decisao.action === "create"
      ? [{ position: decisao.position, inciName: decisao.inciName }]
      : [],
  );
}

export function useDecisaoNaFila({
  recarregar,
  aoAvancar,
  aoExpirar,
}: OpcoesDaDecisao) {
  const [decisao, setDecisao] = useState<EstadoDecisao>(SEM_DECISAO);

  function abrirRecusa() {
    setDecisao((atual) => ({
      ...atual,
      modal: "recusar",
      mensagem: "",
      detalhes: [],
    }));
  }

  function fecharModal() {
    setDecisao((atual) => ({
      ...atual,
      modal: "nenhum",
      aprovacao: null,
      mensagem: "",
      detalhes: [],
    }));
  }

  function avancar(idAtual: string, anuncio: string) {
    setDecisao({ ...SEM_DECISAO, anuncio });
    recarregar();
    aoAvancar(idAtual);
  }

  function tratarErro(erro: unknown) {
    if (erro instanceof ErroSessaoAdminExpirada) {
      aoExpirar();
      return;
    }

    setDecisao((atual) => ({
      ...atual,
      modal: erro instanceof ErroRevisaoInvalida ? "nenhum" : atual.modal,
      enviando: false,
      mensagem:
        erro instanceof Error ? erro.message : "Não foi possível concluir.",
      detalhes: erro instanceof ErroRevisaoInvalida ? erro.detalhes : [],
    }));

    if (
      erro instanceof ErroCandidatoNaoEncontrado ||
      erro instanceof ErroRevisaoEmConflito
    ) {
      recarregar();
    }
  }

  async function concluirPublicacao(
    candidato: Candidato,
    versaoId: number | null,
    publicado: string,
  ) {
    const semNota = `${publicado} A nota base não foi calculada.`;

    if (versaoId === null) {
      avancar(candidato.id, semNota);
      return;
    }

    setDecisao((atual) => ({
      ...atual,
      anuncio: `${publicado} Calculando a nota base...`,
    }));

    try {
      const nota = await calcularNotaBase(versaoId);

      avancar(candidato.id, `${publicado} Nota base: ${nota}.`);
    } catch {
      avancar(candidato.id, semNota);
    }
  }

  async function executar(candidato: Candidato, pedido: PedidoDeDecisao) {
    setDecisao((atual) => ({
      ...atual,
      enviando: true,
      mensagem: "",
      detalhes: [],
    }));

    try {
      if (pedido.tipo === "recusar") {
        await recusarPendente(candidato.id, pedido.recusa);
        avancar(candidato.id, `${candidato.name} recusado.`);
        return;
      }

      const resultado = await aprovarPendente(candidato.id, pedido.aprovacao);

      if (resultado.status === "sincronizacaoFalhou") {
        setDecisao({
          ...SEM_DECISAO,
          semSincronizar: candidato.id,
          anuncio: `${candidato.name} aprovado, mas ainda não entrou no catálogo.`,
        });
        recarregar();
        return;
      }

      await concluirPublicacao(
        candidato,
        resultado.productVersionId,
        `${candidato.name} aprovado e publicado no catálogo.`,
      );
    } catch (erro) {
      tratarErro(erro);
    }
  }

  function pedirAprovacao(candidato: Candidato, aprovacao: AprovacaoCandidato) {
    if (novosDaAprovacao(aprovacao).length > 0) {
      setDecisao((atual) => ({
        ...atual,
        modal: "aprovar",
        aprovacao,
        mensagem: "",
        detalhes: [],
      }));
      return;
    }

    void executar(candidato, { tipo: "aprovar", aprovacao });
  }

  async function sincronizar(candidato: Candidato) {
    setDecisao((atual) => ({
      ...atual,
      enviando: true,
      mensagem: "",
      detalhes: [],
    }));

    try {
      const resultado = await sincronizarPendente(candidato.id);

      if (resultado.status === "publicado") {
        await concluirPublicacao(
          candidato,
          resultado.productVersionId,
          `${candidato.name} publicado no catálogo.`,
        );
        return;
      }

      setDecisao((atual) => ({
        ...atual,
        enviando: false,
        mensagem:
          "A API ainda não conseguiu publicar. Tente de novo em instantes.",
      }));
    } catch (erro) {
      tratarErro(erro);
    }
  }

  return {
    decisao,
    abrirRecusa,
    fecharModal,
    pedirAprovacao,
    executar,
    sincronizar,
  };
}
