import type { AlergiaCatalogo } from "../types/perfil";
import { simularLatencia } from "./mocks/atraso";
import { alergiasMock } from "./mocks/alergias";
import { USAR_MOCK } from "../config/ambiente";
import { listarAlergiasDaApi } from "./api/alergias";

function ordenarPorNome(alergias: AlergiaCatalogo[]): AlergiaCatalogo[] {
  return [...alergias].sort((uma, outra) =>
    uma.name.localeCompare(outra.name, "pt-BR"),
  );
}

export async function buscarCatalogoAlergias(
  sinal?: AbortSignal,
): Promise<AlergiaCatalogo[]> {
  try {
    if (USAR_MOCK) {
      await simularLatencia();
      return ordenarPorNome(alergiasMock);
    }

    return ordenarPorNome(await listarAlergiasDaApi(sinal));
  } catch (erro) {
    if (erro instanceof DOMException && erro.name === "AbortError") {
      throw erro;
    }

    throw new Error("Não foi possível carregar o catálogo de alergias.");
  }
}
