import { USAR_MOCK, URL_API } from "../config/ambiente";
import { simularLatencia } from "./mocks/atraso";

export interface AlergiaOpcao {
  id: string;
  label: string;
}

function ehAlergiaApi(
  valor: unknown,
): valor is { id: number; allergyName: string } {
  if (typeof valor !== "object" || valor === null) {
    return false;
  }

  return (
    "id" in valor &&
    typeof valor.id === "number" &&
    Number.isInteger(valor.id) &&
    valor.id > 0 &&
    "allergyName" in valor &&
    typeof valor.allergyName === "string"
  );
}

export async function buscarCatalogoAlergias(
  signal: AbortSignal,
): Promise<AlergiaOpcao[]> {
  if (USAR_MOCK) {
    await simularLatencia();

    if (signal.aborted) {
      throw new DOMException("Busca cancelada", "AbortError");
    }

    return [
      { id: "mock-lanolina", label: "Lanolina" },
      { id: "mock-oleo-amendoas", label: "Óleo de amêndoas" },
    ];
  }

  const resposta = await fetch(`${URL_API}/api/allergies`, { signal });

  if (!resposta.ok) {
    throw new Error(`Erro ao carregar alergias: ${resposta.status}`);
  }
  const dados: unknown = await resposta.json();

  if (!Array.isArray(dados) || !dados.every(ehAlergiaApi)) {
    throw new Error("Formato inesperado no catálogo de alergias");
  }

  return dados
    .map((alergia) => ({
      id: String(alergia.id),
      label: alergia.allergyName,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
}
