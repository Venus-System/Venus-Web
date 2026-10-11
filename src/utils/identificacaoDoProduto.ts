import type { Produto } from "../types/produto";

export const PRODUTOS_POR_LISTA = 3;

const TAMANHO_MINIMO_DA_PALAVRA = 3;
const PARTE_DO_NOME_COM_A_MARCA = 1 / 2;
const PARTE_DO_NOME_SEM_A_MARCA = 2 / 3;

export interface ResultadoDaBusca {
  candidatos: Produto[];
  daMesmaMarca: Produto[];
  parecidos: Produto[];
}

interface Analise {
  produto: Produto;
  parteDoNome: number;
  temMarca: boolean;
  palavrasEmComum: number;
}

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

function analisar(produto: Produto, lidas: Set<string>): Analise {
  const daMarca = palavras(produto.brand.name);
  const doNome = [...new Set(palavras(produto.name))];
  const doNomeSemAMarca = doNome.filter((palavra) => !daMarca.includes(palavra));
  const achadas = doNome.filter((palavra) => lidas.has(palavra)).length;

  return {
    produto,
    parteDoNome: doNome.length === 0 ? 0 : achadas / doNome.length,
    temMarca: daMarca.length > 0 && daMarca.every((palavra) => lidas.has(palavra)),
    palavrasEmComum: doNomeSemAMarca.filter((palavra) => lidas.has(palavra)).length,
  };
}

function ehCandidato({ parteDoNome, temMarca }: Analise): boolean {
  return (
    parteDoNome >= (temMarca ? PARTE_DO_NOME_COM_A_MARCA : PARTE_DO_NOME_SEM_A_MARCA)
  );
}

function primeiros(
  analises: Analise[],
  pontos: (analise: Analise) => number,
): Produto[] {
  return [...analises]
    .sort((a, b) => pontos(b) - pontos(a))
    .slice(0, PRODUTOS_POR_LISTA)
    .map(({ produto }) => produto);
}

export function procurarPeloTexto(
  linhas: string[],
  produtos: Produto[],
): ResultadoDaBusca {
  const lidas = new Set(palavras(linhas.join(" ")));

  if (lidas.size === 0) {
    return { candidatos: [], daMesmaMarca: [], parecidos: [] };
  }

  const analises = produtos.map((produto) => analisar(produto, lidas));
  const candidatos = analises.filter(ehCandidato);
  const daMesmaMarca = analises.filter(
    (analise) => !ehCandidato(analise) && analise.temMarca,
  );
  const parecidos = analises.filter(
    (analise) =>
      !ehCandidato(analise) && !analise.temMarca && analise.palavrasEmComum > 0,
  );

  return {
    candidatos: primeiros(
      candidatos,
      ({ parteDoNome, temMarca }) => parteDoNome + (temMarca ? 1 : 0),
    ),
    daMesmaMarca: primeiros(daMesmaMarca, ({ parteDoNome }) => parteDoNome),
    parecidos: primeiros(parecidos, ({ palavrasEmComum }) => palavrasEmComum),
  };
}
