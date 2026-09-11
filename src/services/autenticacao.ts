import { simularLatencia } from "./mocks/atraso";
import type { Usuario } from "../types/usuario";
import { validarEmail, validarNome, validarSenha } from "../utils/validacao";

const CHAVE_SESSAO = "venus.sessao";

function ehUsuario(valor: unknown): valor is Usuario {
  return (
    typeof valor === "object" &&
    valor !== null &&
    "id" in valor &&
    typeof valor.id === "string" &&
    "name" in valor &&
    typeof valor.name === "string" &&
    "email" in valor &&
    typeof valor.email === "string"
  );
}

export async function entrar(
  email: string,
  senha: string,
  continuarConectado: boolean,
): Promise<Usuario> {
  await simularLatencia();

  if (validarEmail(email) !== null || senha.length < 8) {
    throw new Error("E-mail ou senha inválidos.");
  }

  const usuario: Usuario = {
    id: "usuario-mock",
    name: email.split("@")[0],
    email,
  };

  gravarSessao(usuario, continuarConectado);

  return usuario;
}

export function sair(): void {
  try {
    localStorage.removeItem(CHAVE_SESSAO);
    sessionStorage.removeItem(CHAVE_SESSAO);
  } catch {
    return;
  }
}

export async function recuperarSessao(): Promise<Usuario | null> {
  const salvo = lerDoArmazenamento();

  if (salvo === null) {
    return null;
  }

  try {
    const dados: unknown = JSON.parse(salvo);
    return ehUsuario(dados) ? dados : null;
  } catch {
    return null;
  }
}

export async function criarConta(
  nome: string,
  email: string,
  senha: string,
): Promise<Usuario> {
  await simularLatencia();

  if (
    validarNome(nome) !== null ||
    validarEmail(email) !== null ||
    validarSenha(senha) !== null
  ) {
    throw new Error("Não foi possível criar a conta com esses dados.");
  }

  const usuario: Usuario = {
    id: crypto.randomUUID(),
    name: nome.trim(),
    email,
  };

  sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify(usuario));

  return usuario;
}

function lerDoArmazenamento(): string | null {
  try {
    return (
      localStorage.getItem(CHAVE_SESSAO) ?? sessionStorage.getItem(CHAVE_SESSAO)
    );
  } catch {
    return null;
  }
}

function gravarSessao(usuario: Usuario, persistente: boolean): void {
  try {
    const destino = persistente ? localStorage : sessionStorage;

    destino.setItem(CHAVE_SESSAO, JSON.stringify(usuario));
  } catch {
    return;
  }
}
