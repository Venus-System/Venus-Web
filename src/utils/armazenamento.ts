const VERSAO = 2;

interface Guardado<T> {
  _versao: number;
  dados: T;
}

export type LugarDoArmazenamento = "local" | "sessao";

function armazenamentoDe(lugar: LugarDoArmazenamento): Storage {
  return lugar === "sessao" ? sessionStorage : localStorage;
}

export function guardar<T>(
  chave: string,
  dados: T,
  lugar: LugarDoArmazenamento = "local",
): void {
  try {
    const conteudo: Guardado<T> = { _versao: VERSAO, dados };

    armazenamentoDe(lugar).setItem(chave, JSON.stringify(conteudo));
  } catch {
    return;
  }
}

function lerTexto(chave: string, lugar: LugarDoArmazenamento): string | null {
  try {
    return armazenamentoDe(lugar).getItem(chave);
  } catch {
    return null;
  }
}

export function limpar(
  chave: string,
  lugar: LugarDoArmazenamento = "local",
): void {
  try {
    armazenamentoDe(lugar).removeItem(chave);
  } catch {
    return;
  }
}

export function ler<T>(
  chave: string,
  ehValido: (valor: unknown) => valor is T,
  lugar: LugarDoArmazenamento = "local",
): T | null {
  const bruto = lerTexto(chave, lugar);

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
    limpar(chave, lugar);
    return null;
  }

  limpar(chave, lugar);
  return null;
}
