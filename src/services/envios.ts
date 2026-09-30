import { USAR_MOCK } from "../config/ambiente";
import type { Envios } from "../types/envio";
import { simularLatencia } from "./mocks/atraso";
import { enviosDoMock } from "./mocks/envios";

const LISTA_INDISPONIVEL: Envios = { listAvailable: false, submissions: [] };

export async function buscarEnvios(): Promise<Envios> {
  try {
    if (USAR_MOCK) {
      await simularLatencia();

      return enviosDoMock();
    }

    return LISTA_INDISPONIVEL;
  } catch {
    throw new Error("Não foi possível carregar os seus envios.");
  }
}
