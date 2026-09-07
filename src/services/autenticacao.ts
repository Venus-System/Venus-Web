import { simularLatencia } from "./mocks/atraso";
import type { Usuario } from "../types/usuario";
const CHAVE_SESSAO = "venus.sessao";

function ehUsuario(valor: unknown): valor is Usuario {
  return (
    typeof valor === "object" &&
    valor !== null &&
    "id" in valor &&
    "name" in valor &&
    "email" in valor
  );
}

export async function entrar(
  email: string,
  senha: string,
  continuarConectado: boolean,
): Promise<Usuario> {
  await simularLatencia();

  if (!email.includes("@") || senha.length < 8) {
    throw new Error("E-mail ou senha inválidos.");
  }

  const usuario: Usuario = {
    id: "usuario-mock",
    name: email.split("@")[0],
    email,
  };
  const destino = continuarConectado ? localStorage : sessionStorage

  destino.setItem(CHAVE_SESSAO, JSON.stringify(usuario));

  return usuario;
}

export function sair(): void {
  localStorage.removeItem(CHAVE_SESSAO);
  sessionStorage.removeItem(CHAVE_SESSAO);
}

export async function recuperarSessao(): Promise<Usuario | null> {
  const salvo =
    localStorage.getItem(CHAVE_SESSAO) ?? sessionStorage.getItem(CHAVE_SESSAO);

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
