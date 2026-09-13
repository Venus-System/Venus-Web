import { URL_API, USAR_MOCK } from "../../config/ambiente";
import type { Usuario } from "../../types/usuario";

export async function criarUsuarioNaApi(usuario: Usuario): Promise<void> {
  if (USAR_MOCK) {
    return;
  }

  const resposta = await fetch(`${URL_API}/api/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firebaseUid: usuario.id,
      name: usuario.name,
      email: usuario.email,
      status: "ACTIVE",
    }),
  });

  if (!resposta.ok) {
    throw new Error(`A API respondeu ${resposta.status} ao criar o usuário.`);
  }
}
