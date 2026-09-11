function normalizar(valor: unknown): string | null {
  return typeof valor === "string" ? valor.trim().toLowerCase() : null;
}

function lerUsarMock(bruto: unknown): boolean {
  if (bruto === undefined) {
    return true;
  }

  const valor = normalizar(bruto);

  if (valor === "" || valor === "true") {
    return true;
  }

  if (valor === "false") {
    return false;
  }

  throw new Error(
    `VITE_USAR_MOCK aceita "true" ou "false", e recebeu "${String(bruto)}".`,
  );
}

export const USAR_MOCK = lerUsarMock(import.meta.env.VITE_USAR_MOCK);

function lerUrlApi(bruto: unknown): string {
  if (USAR_MOCK) {
    return "";
  }

  const valor = typeof bruto === "string" ? bruto.trim() : "";

  if (valor === "") {
    throw new Error(
      'VITE_API_URL é obrigatória quando VITE_USAR_MOCK é "false".',
    );
  }

  return valor.replace(/\/+$/, "");
}

export const URL_API = lerUrlApi(import.meta.env.VITE_API_URL);
