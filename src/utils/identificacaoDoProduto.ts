import type { Produto } from "../types/produto";

export const CANDIDATOS_MOSTRADOS = 3;

const TAMANHO_MINIMO_DA_PALAVRA = 3;
const PARTE_DO_NOME_COM_A_MARCA = 1 / 2;
const PARTE_DO_NOME_SEM_A_MARCA = 2 / 3;

function palavras(texto: string): string[] {
  return texto
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter((palavra) => palavra.length >= TAMANHO_MINIMO_DA_PALAVRA);
}

export function temTextoLegivel(linhas: string[]): boolean {
  return palavras(linhas.join(" ")).some((palavra) => /[A-Z]{3,}/.test(palavra));
}

export function candidatosDoCatalogo(
  linhas: string[],
  produtos: Produto[],
): Produto[] {
  const lidas = new Set(palavras(linhas.join(" ")));

  if (lidas.size === 0) {
    return [];
  }

  const pontuados = produtos.flatMap((produto) => {
    const doNome = [...new Set(palavras(produto.name))];
    const daMarca = palavras(produto.brand.name);

    if (doNome.length === 0) {
      return [];
    }

    const parteDoNome =
      doNome.filter((palavra) => lidas.has(palavra)).length / doNome.length;
    const temMarca =
      daMarca.length > 0 && daMarca.every((palavra) => lidas.has(palavra));
    const minimo = temMarca ? PARTE_DO_NOME_COM_A_MARCA : PARTE_DO_NOME_SEM_A_MARCA;

    return parteDoNome >= minimo
      ? [{ produto, pontos: parteDoNome + (temMarca ? 1 : 0) }]
      : [];
  });

  return pontuados
    .sort((a, b) => b.pontos - a.pontos)
    .slice(0, CANDIDATOS_MOSTRADOS)
    .map(({ produto }) => produto);
}
