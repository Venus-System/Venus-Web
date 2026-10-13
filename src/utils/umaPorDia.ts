function diaDe(data: string): string {
  const lida = new Date(data);

  return Number.isNaN(lida.getTime()) ? data : lida.toDateString();
}

export function umaPorDia<T>(
  itens: T[],
  identificar: (item: T) => string | number,
  dataDe: (item: T) => string,
): T[] {
  const vistas = new Set<string>();

  return itens.filter((item) => {
    const chave = `${identificar(item)}|${diaDe(dataDe(item))}`;

    if (vistas.has(chave)) {
      return false;
    }

    vistas.add(chave);

    return true;
  });
}
