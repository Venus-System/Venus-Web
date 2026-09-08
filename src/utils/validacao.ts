export function validarNome(nome: string): string | null {
  if (nome.trim() === "") {
    return "Informe como podemos te chamar.";
  }

  return null;
}

export function validarSenha(senha: string): string | null {
  if (senha.length < 8) {
    return "A senha precisa de pelo menos 8 caracteres";
  }

  return null;
}

export function validarEmail(email: string): string | null {
  const valor = email.trim();

  if (valor === "") {
    return "Informe o seu e-mail";
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
    return "Digite um e-mail válido, como voce@email.com."
  }

  return null;
}

export function validarSenhaPreenchida(senha: string): string | null {
  if (senha === "") {
    return "Informe a senha.";
  }

  return null;
}
