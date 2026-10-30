import { GOOGLE_CLIENT_ID, URL_IA, USAR_MOCK } from "../config/ambiente";
import type { ConexaoDaAgenda, PedidoDeConexao } from "../types/agenda";
import {
  conectarNaApi,
  desconectarNaApi,
  lerConexaoNaApi,
} from "./api/agenda";
import { ErroDeOrientacao, ErroServicoIndisponivel } from "./erros";
import {
  CODIGO_DO_MOCK,
  conectarNoMock,
  conexaoDoMock,
  desconectarNoMock,
} from "./mocks/agenda";

const AUTORIZACAO_DO_GOOGLE = "https://accounts.google.com/o/oauth2/v2/auth";

const ESCOPOS = [
  "https://www.googleapis.com/auth/calendar.freebusy",
  "https://www.googleapis.com/auth/calendar.events",
];

export function agendaDisponivel(): boolean {
  return USAR_MOCK || (URL_IA !== "" && GOOGLE_CLIENT_ID !== "");
}

export function enderecoDeAutorizacao(
  pedido: PedidoDeConexao,
  redirectUri: string,
): string {
  if (USAR_MOCK) {
    const volta = new URLSearchParams({
      code: CODIGO_DO_MOCK,
      state: pedido.state,
    });

    return `${redirectUri}?${volta.toString()}`;
  }

  const parametros = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: ESCOPOS.join(" "),
    access_type: "offline",
    prompt: "consent",
    code_challenge: pedido.codeChallenge,
    code_challenge_method: "S256",
    state: pedido.state,
  });

  return `${AUTORIZACAO_DO_GOOGLE}?${parametros.toString()}`;
}

function erroDaAgenda(erro: unknown, padrao: string): Error {
  if (
    erro instanceof ErroDeOrientacao ||
    erro instanceof ErroServicoIndisponivel
  ) {
    return erro;
  }

  return new Error(padrao);
}

function verificarDisponivel(): void {
  if (!agendaDisponivel()) {
    throw new ErroDeOrientacao("A Google Agenda não está disponível agora.");
  }
}

export async function lerConexaoDaAgenda(
  usuarioId: string,
): Promise<ConexaoDaAgenda> {
  try {
    verificarDisponivel();

    return USAR_MOCK
      ? await conexaoDoMock(usuarioId)
      : await lerConexaoNaApi();
  } catch (erro) {
    throw erroDaAgenda(erro, "Não foi possível ver se a sua agenda está conectada.");
  }
}

export async function conectarAgenda(
  code: string,
  redirectUri: string,
  codeVerifier: string,
  usuarioId: string,
): Promise<void> {
  try {
    verificarDisponivel();

    if (USAR_MOCK) {
      await conectarNoMock(usuarioId);
      return;
    }

    await conectarNaApi(code, redirectUri, codeVerifier);
  } catch (erro) {
    throw erroDaAgenda(erro, "Não foi possível conectar a sua agenda.");
  }
}

export async function desconectarAgenda(usuarioId: string): Promise<void> {
  try {
    verificarDisponivel();

    if (USAR_MOCK) {
      await desconectarNoMock(usuarioId);
      return;
    }

    await desconectarNaApi();
  } catch (erro) {
    throw erroDaAgenda(erro, "Não foi possível desconectar a sua agenda.");
  }
}
