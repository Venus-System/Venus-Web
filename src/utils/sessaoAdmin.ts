import type { Administrador, PapelAdmin, SessaoAdmin } from "../types/admin";

const CHAVE_SESSAO_ADMIN = "venus.sessaoAdmin";

export const PAPEIS_ADMIN: PapelAdmin[] = ["admin", "moderator", "analyst"];

function ehAdministrador(valor: unknown): valor is Administrador {
  return (
    typeof valor === "object" &&
    valor !== null &&
    "id" in valor &&
    typeof valor.id === "number" &&
    "name" in valor &&
    typeof valor.name === "string" &&
    "email" in valor &&
    typeof valor.email === "string" &&
    "role" in valor &&
    PAPEIS_ADMIN.some((papel) => papel === valor.role)
  );
}

function ehSessaoAdmin(valor: unknown): valor is SessaoAdmin {
  return (
    typeof valor === "object" &&
    valor !== null &&
    "token" in valor &&
    typeof valor.token === "string" &&
    valor.token !== "" &&
    "expiresAt" in valor &&
    typeof valor.expiresAt === "string" &&
    "admin" in valor &&
    ehAdministrador(valor.admin)
  );
}

function expirou(sessao: SessaoAdmin): boolean {
  const limite = Date.parse(sessao.expiresAt);

  return Number.isNaN(limite) || limite <= Date.now();
}

export function limparSessaoAdmin(): void {
  try {
    sessionStorage.removeItem(CHAVE_SESSAO_ADMIN);
  } catch {
    return;
  }
}

export function guardarSessaoAdmin(sessao: SessaoAdmin): void {
  try {
    sessionStorage.setItem(CHAVE_SESSAO_ADMIN, JSON.stringify(sessao));
  } catch {
    return;
  }
}

export function lerSessaoAdmin(): SessaoAdmin | null {
  try {
    const bruto = sessionStorage.getItem(CHAVE_SESSAO_ADMIN);

    if (bruto === null) {
      return null;
    }

    const dados: unknown = JSON.parse(bruto);

    if (ehSessaoAdmin(dados) && !expirou(dados)) {
      return dados;
    }
  } catch {
    limparSessaoAdmin();
    return null;
  }

  limparSessaoAdmin();
  return null;
}
