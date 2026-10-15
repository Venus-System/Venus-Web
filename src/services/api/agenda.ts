import { URL_IA } from "../../config/ambiente";
import type { ConexaoDaAgenda } from "../../types/agenda";
import { ErroDeOrientacao } from "../erros";
import { comoObjeto } from "./leitura";
import { pedir, verificarResposta } from "./requisicao";

const CAMINHO = "/v1/integracoes/google-calendar";

function verificarConexao(resposta: Response): void {
  if (resposta.status === 401 || resposta.status === 403) {
    throw new ErroDeOrientacao("Entre de novo para conectar a sua agenda.");
  }

  if (resposta.status === 409) {
    throw new ErroDeOrientacao(
      "A Venus não encontrou a sua conta para ligar a agenda. Tente de novo mais tarde.",
    );
  }

  if (resposta.status === 429) {
    throw new ErroDeOrientacao(
      "Muitas tentativas em pouco tempo. Espere um pouco e tente de novo.",
    );
  }

  verificarResposta(resposta, CAMINHO);
}

export async function lerConexaoNaApi(): Promise<ConexaoDaAgenda> {
  const resposta = await pedir(`${URL_IA}${CAMINHO}`);

  verificarConexao(resposta);

  const dados = comoObjeto(await resposta.json());

  if (typeof dados.conectado !== "boolean") {
    throw new Error("A conexão da agenda não veio no formato esperado.");
  }

  return { connected: dados.conectado };
}

export async function conectarNaApi(
  code: string,
  redirectUri: string,
  codeVerifier: string,
): Promise<void> {
  const resposta = await pedir(`${URL_IA}${CAMINHO}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  });

  if (resposta.status === 400) {
    throw new ErroDeOrientacao(
      "O Google não aceitou a conexão. Tente conectar de novo.",
    );
  }

  if (resposta.status === 422) {
    throw new ErroDeOrientacao(
      "O Google não mandou a permissão de criar eventos. Conecte de novo e deixe todas as permissões marcadas.",
    );
  }

  verificarConexao(resposta);
}

export async function desconectarNaApi(): Promise<void> {
  const resposta = await pedir(`${URL_IA}${CAMINHO}`, { method: "DELETE" });

  verificarConexao(resposta);
}
