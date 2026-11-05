import { MODO_EXPOSICAO, URL_CLASSIFICACAO, URL_IA } from "../config/ambiente";

export type Canal = "api" | "classificacao" | "ia";

const TEMPO_LIMITE: Record<Canal, number> = {
  api: 10000,
  classificacao: 20000,
  ia: 30000,
};

const JANELA_DE_FALHA = 60000;

const ultimaFalha: Record<Canal, number> = {
  api: 0,
  classificacao: 0,
  ia: 0,
};

function canalDaUrl(url: string): Canal {
  if (URL_IA !== "" && url.startsWith(URL_IA)) {
    return "ia";
  }

  if (URL_CLASSIFICACAO !== "" && url.startsWith(URL_CLASSIFICACAO)) {
    return "classificacao";
  }

  return "api";
}

function falhouHaPouco(canal: Canal): boolean {
  return Date.now() - ultimaFalha[canal] < JANELA_DE_FALHA;
}

function estaForaDoAr(canal: Canal): boolean {
  return (
    falhouHaPouco(canal) || (canal === "classificacao" && falhouHaPouco("api"))
  );
}

export function registrarFalhaDoServico(url: string): void {
  if (MODO_EXPOSICAO) {
    ultimaFalha[canalDaUrl(url)] = Date.now();
  }
}

function comTempoLimite<T>(promessa: Promise<T>, canal: Canal): Promise<T> {
  return new Promise<T>((resolver, rejeitar) => {
    const relogio = setTimeout(() => {
      ultimaFalha[canal] = Date.now();
      rejeitar(new Error(`O canal ${canal} demorou demais para responder.`));
    }, TEMPO_LIMITE[canal]);

    promessa.then(resolver, rejeitar).finally(() => clearTimeout(relogio));
  });
}

async function usarMock<T>(
  canal: Canal,
  mock: () => Promise<T> | T,
): Promise<T> {
  console.warn(`Modo exposição: dados de demonstração no canal ${canal}.`);

  return await mock();
}

export async function comFallbackDeMock<T>(
  canal: Canal,
  real: () => Promise<T>,
  mock: () => Promise<T> | T,
): Promise<T> {
  if (!MODO_EXPOSICAO) {
    return await real();
  }

  if (estaForaDoAr(canal)) {
    return await usarMock(canal, mock);
  }

  try {
    return await comTempoLimite(real(), canal);
  } catch (erro) {
    if (erro instanceof DOMException && erro.name === "AbortError") {
      throw erro;
    }

    return await usarMock(canal, mock);
  }
}

export async function gravarComFallbackDeMock<T>(
  real: () => Promise<T>,
  mock: () => Promise<T> | T,
): Promise<T> {
  if (!MODO_EXPOSICAO) {
    return await real();
  }

  if (estaForaDoAr("api")) {
    return await usarMock("api", mock);
  }

  try {
    return await comTempoLimite(real(), "api");
  } catch (erro) {
    if (!estaForaDoAr("api")) {
      throw erro;
    }

    return await usarMock("api", mock);
  }
}
