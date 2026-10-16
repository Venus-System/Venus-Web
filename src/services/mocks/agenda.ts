import type { ConexaoDaAgenda } from "../../types/agenda";

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
  await esperar();

  return { connected: contasConectadas.has(usuarioId) };
}

export async function conectarNoMock(usuarioId: string): Promise<void> {
  await esperar();

  contasConectadas.add(usuarioId);
}

export async function desconectarNoMock(usuarioId: string): Promise<void> {
  await esperar();

  contasConectadas.delete(usuarioId);
}
