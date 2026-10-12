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

const calculos = new Map<string, Promise<AnalisePessoal>>();

export function esquecerAnalisesPessoais(): void {
  calculos.clear();
}

function chaveDoCalculo(usuarioId: number, versaoId: number): string {
  return `${usuarioId}:${versaoId}`;
}

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
    erro instanceof ErroDeOrientacao ||
    erro instanceof ErroServicoIndisponivel
  ) {
    throw erro;
  }

  throw new Error(FALHA);
}

async function lerSalva(
  usuarioId: number,
  versaoId: number,
): Promise<AnalisePessoal | null> {
  try {
    const leitura = await buscarUltimaClassificacaoNaApi(usuarioId, versaoId);

    return leitura.codigo === "OK"
      ? { situacao: "pronta", analise: leitura.analise }
      : null;
  } catch {
    return null;
  }
}

async function calcularOuLerSalva(
  usuarioId: number,
  versaoId: number,
): Promise<AnalisePessoal> {
  try {
    return paraSituacao(await calcularClassificacaoNaApi(usuarioId, versaoId));
  } catch (erro) {
    if (erro instanceof ErroDeOrientacao) {
      throw erro;
    }

    const salva = await lerSalva(usuarioId, versaoId);

    if (salva === null) {
      throw erro;
    }

    return salva;
  }
}

function calcularUmaVez(
  usuarioId: number,
  versaoId: number,
): Promise<AnalisePessoal> {
  const chave = chaveDoCalculo(usuarioId, versaoId);
  const guardado = calculos.get(chave);

  if (guardado !== undefined) {
    return guardado;
  }

  const calculo = calcularOuLerSalva(usuarioId, versaoId).then(
    (resultado) => {
      if (resultado.situacao !== "pronta" || !resultado.analise.complete) {
        calculos.delete(chave);
      }

      return resultado;
    },
    (erro: unknown) => {
      calculos.delete(chave);
      throw erro;
    },
  );

  calculos.set(chave, calculo);

  return calculo;
}

export async function buscarAnalisePessoal(
  slug: string,
  versaoId: number | null,
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

    return await calcularUmaVez(await usuarioDaApi(), versaoId);
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

    const usuarioId = await usuarioDaApi();

    calculos.delete(chaveDoCalculo(usuarioId, versaoId));

    return await calcularUmaVez(usuarioId, versaoId);
  } catch (erro) {
    return repassarOuTrocar(erro);
  }
}
