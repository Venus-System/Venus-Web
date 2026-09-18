import type { AlergiaApi } from "./tipos";
import type { AlergiaCatalogo } from "../../types/perfil";
import { URL_API } from "../../config/ambiente";

function ehAlergiaApi(valor: unknown): valor is AlergiaApi {
  return (
    typeof valor === "object" &&
    valor !== null &&
    "id" in valor &&
    typeof valor.id === "number" &&
    "allergyName" in valor &&
    typeof valor.allergyName === "string"
  );
}

export async function listarAlergiasDaApi(
  sinal?: AbortSignal,
): Promise<AlergiaCatalogo[]> {
  const resposta = await fetch(`${URL_API}/api/allergies`, { signal: sinal });

  if (!resposta.ok) {
    throw new Error(`A API respondeu ${resposta.status} ao listar alergias.`);
  }

  const dados: unknown = await resposta.json();

  if (!Array.isArray(dados)) {
    throw new Error("A listagem de alergias não veio no formato esperado.");
  }

  const alergias: AlergiaCatalogo[] = [];

  for (const item of dados) {
    if (ehAlergiaApi(item)) {
      alergias.push({ id: String(item.id), name: item.allergyName });
    }
  }

  return alergias;
}
