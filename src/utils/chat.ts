export const TAMANHO_MAXIMO_DA_MENSAGEM = 4000;

export const SUGESTOES_DO_PRODUTO = [
  "Por que essa nota?",
  "Tem algo das minhas alergias?",
  "Sugira um parecido",
];

export const SUGESTOES_GERAIS = ["Como a nota é calculada?"];

export function perguntaSobreProduto(
  texto: string,
  nomeDoProduto: string | undefined,
): string {
  const limpo = texto.trim();

  if (limpo === "" || nomeDoProduto === undefined) {
    return limpo;
  }

  if (limpo.toLowerCase().includes(nomeDoProduto.toLowerCase())) {
    return limpo;
  }

  const comNome = `Sobre ${nomeDoProduto}: ${limpo}`;

  return comNome.length > TAMANHO_MAXIMO_DA_MENSAGEM ? limpo : comNome;
}
