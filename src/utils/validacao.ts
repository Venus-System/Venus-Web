import type { MotivoRecusa } from "../types/admin";
import type { Estrelas, MotivoDenuncia } from "../types/avaliacao";
import type { FaixaEtaria } from "../types/perfil";
import type { AlergiaSelecionada } from "../types/questionario";

export function validarNome(nome: string): string | null {
  if (nome.trim() === "") {
    return "Informe como podemos te chamar.";
  }

  return null;
}

export function validarSenha(senha: string): string | null {
  if (senha.length < 8) {
    return "A senha precisa de pelo menos 8 caracteres.";
  }

  return null;
}

export function validarEmail(email: string): string | null {
  const valor = email.trim();

  if (valor === "") {
    return "Informe o seu e-mail.";
  }

  const partes = valor.split("@");

  if (partes.length !== 2 || partes[0] === "") {
    return "Digite um e-mail válido, como voce@email.com.";
  }

  const dominio = partes[1];

  if (
    !dominio.includes(".") ||
    dominio.startsWith(".") ||
    dominio.endsWith(".")
  ) {
    return "Digite um e-mail válido, como voce@email.com.";
  }

  return null;
}

export function validarSenhaPreenchida(senha: string): string | null {
  if (senha === "") {
    return "Informe a senha.";
  }

  return null;
}

export type FaixaSenha = "fraca" | "media" | "forte";

export interface ForcaSenha {
  pontos: number;
  faixa: FaixaSenha;
}

export function forcaDaSenha(senha: string): ForcaSenha {
  const criterios = [
    senha.length >= 8,
    /[a-zA-Z]/.test(senha),
    /[0-9]/.test(senha),
    /[^a-zA-Z0-9]/.test(senha),
  ];

  const pontos = criterios.filter(Boolean).length;

  if (pontos <= 1) {
    return { pontos, faixa: "fraca" };
  }

  if (pontos <= 3) {
    return { pontos, faixa: "media" };
  }

  return { pontos, faixa: "forte" };
}

export function validarCodigo(codigo: string): string | null {
  if (!/^[0-9]{6}$/.test(codigo.trim())) {
    return "O código tem 6 dígitos numéricos.";
  }

  return null;
}

export function validarConfirmacaoSenha(
  senha: string,
  confirmacao: string,
): string | null {
  if (confirmacao !== senha) {
    return "As senhas não são iguais.";
  }

  return null;
}

export function validarFaixaEtaria(faixa: FaixaEtaria | ""): string | null {
  if (faixa === "") {
    return "Informe a sua faixa etária.";
  }

  return null;
}

export function validarGravidadeDasAlergias(
  alergias: AlergiaSelecionada[],
): string | null {
  if (alergias.some((alergia) => alergia.severity === "")) {
    return "Informe a gravidade de cada alergia que você escolheu.";
  }

  return null;
}

export const MINIMO_DO_COMENTARIO = 10;
export const MAXIMO_DO_COMENTARIO = 900;

export function validarMotivoDaRecusa(motivo: MotivoRecusa | ""): string | null {
  return motivo === "" ? "Escolha por que está recusando." : null;
}

export function validarComentarioDaRecusa(comentario: string): string | null {
  const limpo = comentario.trim();

  if (limpo === "") {
    return "Escreva um comentário para quem enviou.";
  }

  if (limpo.length < MINIMO_DO_COMENTARIO) {
    return `Explique em pelo menos ${MINIMO_DO_COMENTARIO} caracteres, para quem enviou saber o que corrigir.`;
  }

  if (limpo.length > MAXIMO_DO_COMENTARIO) {
    return `O comentário pode ter até ${MAXIMO_DO_COMENTARIO} caracteres.`;
  }

  return null;
}

export function validarNomeDoProduto(nome: string): string | null {
  return nome.trim() === "" ? "Informe o nome do produto." : null;
}

export function validarMarca(marcaId: string): string | null {
  return marcaId === "" ? "Escolha a marca do produto." : null;
}

export function validarCategoria(categoriaId: string): string | null {
  return categoriaId === "" ? "Escolha a categoria do produto." : null;
}

export function validarDecisaoDoIngrediente(opcao: string): string | null {
  return opcao === "" ? "Decida o que fazer com este ingrediente." : null;
}

export function validarNomeInci(nome: string): string | null {
  return nome.trim() === ""
    ? "Informe o nome INCI do ingrediente novo."
    : null;
}

export const MAXIMO_DO_COMENTARIO_DA_AVALIACAO = 500;

export function validarNotaDaAvaliacao(nota: Estrelas | null): string | null {
  return nota === null ? "Escolha uma nota de 1 a 5 estrelas." : null;
}

export function validarTituloDaAvaliacao(titulo: string): string | null {
  return titulo.trim() === ""
    ? "Escreva um título para a sua avaliação."
    : null;
}

export function validarMotivoDaDenuncia(
  motivo: MotivoDenuncia | "",
): string | null {
  return motivo === "" ? "Escolha o motivo da denúncia." : null;
}

export function validarComentarioDaAvaliacao(
  comentario: string,
): string | null {
  const limpo = comentario.trim();

  if (limpo === "") {
    return "Conte como foi a sua experiência com o produto.";
  }

  if (limpo.length > MAXIMO_DO_COMENTARIO_DA_AVALIACAO) {
    return `O comentário pode ter até ${MAXIMO_DO_COMENTARIO_DA_AVALIACAO} caracteres.`;
  }

  return null;
}
