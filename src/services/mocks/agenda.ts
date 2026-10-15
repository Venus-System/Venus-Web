import type { ConexaoDaAgenda } from "../../types/agenda";

const TEMPO_PARA_RESPONDER = 800;

export const CODIGO_DO_MOCK = "codigo-do-mock";

let conectada = false;

function esperar(): Promise<void> {
  return new Promise((resolver) => {
    setTimeout(resolver, TEMPO_PARA_RESPONDER);
  });
}

export async function conexaoDoMock(): Promise<ConexaoDaAgenda> {
  await esperar();

  return { connected: conectada };
}

export async function conectarNoMock(): Promise<void> {
  await esperar();

  conectada = true;
}

export async function desconectarNoMock(): Promise<void> {
  await esperar();

  conectada = false;
}
