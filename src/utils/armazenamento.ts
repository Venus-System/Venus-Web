const VERSAO = 2;

interface Guardado<T> {
  _versao: number;
  dados: T;
}

export function guardar<T>(chave: string, dados: T): void {
  try {
    const conteudo: Guardado<T> = { _versao: VERSAO, dados };

    localStorage.setItem(chave, JSON.stringify(conteudo));
  } catch {
    return;
  }
}

function lerTexto(chave: string): string | null {
  try {
    return localStorage.getItem(chave);
  } catch {
    return null;
  }
}

export function limpar(chave: string): void {
  try {
    localStorage.removeItem(chave);
  } catch {
    return;
  }
}

export function ler<T>(
  chave: string,
  ehValido: (valor: unknown) => valor is T,
): T | null {
  const bruto = lerTexto(chave);

  if (bruto === null) {
    return null;
  }

  try {
    const conteudo: unknown = JSON.parse(bruto);

    if (
      typeof conteudo === "object" &&
      conteudo !== null &&
      "_versao" in conteudo &&
      conteudo._versao === VERSAO &&
      "dados" in conteudo &&
      ehValido(conteudo.dados)
    ) {
      return conteudo.dados;
    }
  } catch {
    limpar(chave);
    return null;
  }

  limpar(chave);
  return null;
}
