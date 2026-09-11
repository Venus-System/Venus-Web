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
