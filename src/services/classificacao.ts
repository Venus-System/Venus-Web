import { URL_CLASSIFICACAO, USAR_MOCK } from "../config/ambiente";
import type { AnalisePessoal } from "../types/analise";
import {
  buscarUltimaClassificacaoNaApi,
  calcularClassificacaoNaApi,
} from "./api/classificacao";
import type { LeituraDaClassificacao } from "./api/classificacao";
import { garantirIdDoUsuarioNaApi } from "./autenticacao";
import { ErroDeOrientacao, ErroServicoIndisponivel } from "./erros";
import { simularLatencia } from "./mocks/atraso";
import { analisesPessoaisMock } from "./mocks/classificacao";
import { lerPerfilFalso } from "./mocks/perfil";

const SEM_FORMULA =
  "Este produto está sem a lista de ingredientes, então não dá para cruzar a fórmula com o seu perfil.";

const EM_REVISAO =
  "A fórmula deste produto está em revisão pela equipe Venus. Enquanto isso, vale a avaliação geral.";

const FORA_DO_AR =
  "A análise para o seu perfil não está disponível agora. Vale a avaliação geral.";

const FALHA = "Não foi possível calcular a análise para o seu perfil.";

function paraSituacao(leitura: LeituraDaClassificacao): AnalisePessoal {
  switch (leitura.codigo) {
    case "OK":
      return { situacao: "pronta", analise: leitura.analise };
    case "PROFILE_NOT_FOUND":
      return { situacao: "sem-perfil" };
    case "VERSION_UNDER_REVIEW":
      return { situacao: "indisponivel", mensagem: EM_REVISAO };
    case "NO_INGREDIENTS":
      return { situacao: "indisponivel", mensagem: SEM_FORMULA };
    case "ANALYSIS_NOT_FOUND":
      throw new Error(FALHA);
  }
}

function doMock(slug: string, calculadaEm?: string): AnalisePessoal {
  if (lerPerfilFalso() === null) {
    return { situacao: "sem-perfil" };
  }

  const analise = analisesPessoaisMock[slug];

  if (!analise) {
    return { situacao: "indisponivel", mensagem: SEM_FORMULA };
  }

  return {
    situacao: "pronta",
    analise: { ...analise, calculatedAt: calculadaEm ?? analise.calculatedAt },
  };
}

async function usuarioDaApi(): Promise<number> {
  const usuarioId = await garantirIdDoUsuarioNaApi();

  if (usuarioId === null) {
    throw new ErroDeOrientacao(
      "Não conseguimos ligar esta conta ao cadastro da API neste navegador. Entre de novo e tente outra vez.",
    );
  }

  return usuarioId;
}

function repassarOuTrocar(erro: unknown): never {
  if (
    (erro instanceof DOMException && erro.name === "AbortError") ||
    erro instanceof ErroDeOrientacao ||
    erro instanceof ErroServicoIndisponivel
  ) {
    throw erro;
  }

  throw new Error(FALHA);
}

export async function buscarAnalisePessoal(
  slug: string,
  versaoId: number | null,
  sinal?: AbortSignal,
): Promise<AnalisePessoal> {
  try {
    if (USAR_MOCK) {
      await simularLatencia();

      return doMock(slug);
    }

    if (URL_CLASSIFICACAO === "") {
      return { situacao: "indisponivel", mensagem: FORA_DO_AR };
    }

    if (versaoId === null) {
      return { situacao: "indisponivel", mensagem: SEM_FORMULA };
    }

    const usuarioId = await usuarioDaApi();
    const ultima = await buscarUltimaClassificacaoNaApi(
      usuarioId,
      versaoId,
      sinal,
    );

    if (ultima.codigo !== "ANALYSIS_NOT_FOUND") {
      return paraSituacao(ultima);
    }

    return paraSituacao(
      await calcularClassificacaoNaApi(usuarioId, versaoId, sinal),
    );
  } catch (erro) {
    return repassarOuTrocar(erro);
  }
}

export async function recalcularAnalisePessoal(
  slug: string,
  versaoId: number | null,
): Promise<AnalisePessoal> {
  try {
    if (USAR_MOCK) {
      await simularLatencia();

      return doMock(slug, new Date().toISOString());
    }

    if (URL_CLASSIFICACAO === "") {
      return { situacao: "indisponivel", mensagem: FORA_DO_AR };
    }

    if (versaoId === null) {
      return { situacao: "indisponivel", mensagem: SEM_FORMULA };
    }

    return paraSituacao(
      await calcularClassificacaoNaApi(await usuarioDaApi(), versaoId),
    );
  } catch (erro) {
    return repassarOuTrocar(erro);
  }
}
