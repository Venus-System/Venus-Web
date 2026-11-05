import { MODO_EXPOSICAO } from "../config/ambiente";

export const MENSAGEM_DE_INSTABILIDADE =
  "Não conseguimos resposta agora. Pode ser a rede deste local ou um serviço externo que a Venus usa. Tente de novo em instantes.";

const FALHA_DE_SISTEMA = /^(Não foi possível|Não conseguimos|Não deu para|A API|Falha)/;
const ORIENTA_A_PESSOA = /Confira|com esses dados/;

export function mensagemVisivel(mensagem: string): string {
  return MODO_EXPOSICAO &&
    FALHA_DE_SISTEMA.test(mensagem) &&
    !ORIENTA_A_PESSOA.test(mensagem)
    ? MENSAGEM_DE_INSTABILIDADE
    : mensagem;
}

export function mensagemDoErro(erro: unknown, padrao: string): string {
  return mensagemVisivel(erro instanceof Error ? erro.message : padrao);
}
