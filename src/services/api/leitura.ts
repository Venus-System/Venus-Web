export type CampoDesconhecido = Partial<Record<string, unknown>>;

export function comoObjeto(valor: unknown): CampoDesconhecido {
  return typeof valor === "object" && valor !== null
    ? (valor as CampoDesconhecido)
    : {};
}

export function numero(valor: unknown): number | null {
  return typeof valor === "number" ? valor : null;
}

export function texto(valor: unknown): string | null {
  return typeof valor === "string" && valor.trim() !== "" ? valor.trim() : null;
}

export function lerTodos<T>(
  itens: unknown[],
  ler: (valor: unknown) => T | null,
): T[] {
  return itens.flatMap((item) => {
    const lido = ler(item);

    return lido === null ? [] : [lido];
  });
}
