import type { ConexaoDaAgenda } from "../../types/agenda";
import { repassarErro } from "../erros";

const TEMPO_PARA_RESPONDER = 800;

export const CODIGO_DO_MOCK = "codigo-do-mock";

const contasConectadas = new Set<string>();

function esperar(): Promise<void> {
  return new Promise((resolver) => {
    setTimeout(resolver, TEMPO_PARA_RESPONDER);
  });
}

export async function conexaoDoMock(
  usuarioId: string,
): Promise<ConexaoDaAgenda> {
  try {
    await esperar();

    return { connected: contasConectadas.has(usuarioId) };
  } catch (erro) {
    repassarErro(erro, "Não foi possível ver a agenda de exemplo.");
  }
}

export async function conectarNoMock(usuarioId: string): Promise<void> {
  try {
    await esperar();

    contasConectadas.add(usuarioId);
  } catch (erro) {
    repassarErro(erro, "Não foi possível conectar a agenda de exemplo.");
  }
}

export async function desconectarNoMock(usuarioId: string): Promise<void> {
  try {
    await esperar();

    contasConectadas.delete(usuarioId);
  } catch (erro) {
    repassarErro(erro, "Não foi possível desconectar a agenda de exemplo.");
  }
}
