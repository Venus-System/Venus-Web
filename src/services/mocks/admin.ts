import type { Administrador, SessaoAdmin } from "../../types/admin";
import { ErroCredenciaisInvalidas } from "../erros";

const DURACAO_DA_SESSAO = 8 * 60 * 60 * 1000;

const administradoresMock: Administrador[] = [
  {
    id: 1,
    name: "Curadoria Venus",
    email: "curadoria@venus.dev",
    role: "admin",
  },
  {
    id: 2,
    name: "Moderação Venus",
    email: "moderacao@venus.dev",
    role: "moderator",
  },
  {
    id: 3,
    name: "Análise Venus",
    email: "analise@venus.dev",
    role: "analyst",
  },
];

export function entrarComoAdminNoMock(
  email: string,
  senha: string,
): SessaoAdmin {
  const procurado = email.trim().toLowerCase();
  const admin = administradoresMock.find(
    (conta) => conta.email === procurado,
  );

  if (admin === undefined || senha.length < 8) {
    throw new ErroCredenciaisInvalidas();
  }

  return {
    token: `mock-${crypto.randomUUID()}`,
    expiresAt: new Date(Date.now() + DURACAO_DA_SESSAO).toISOString(),
    admin,
  };
}
