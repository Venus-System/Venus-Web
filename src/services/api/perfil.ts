import { URL_API } from "../../config/ambiente";
import type { PerfilParaSalvar } from "../../types/perfil";

function paraEnum(valor: string | null): string | undefined {
  return valor === null ? undefined : valor.toUpperCase();
}

function paraCurvatura(valor: string | null): string | undefined {
  return valor === null ? undefined : `TYPE_${valor.toUpperCase()}`;
}

function corpoDoPerfil(
  usuarioId: number,
  perfil: PerfilParaSalvar,
): Record<string, unknown> {
  return {
    userId: usuarioId,
    gender: paraEnum(perfil.gender),
    ageRange: paraEnum(perfil.ageRange),
    hairType: paraCurvatura(perfil.hairType),
    skinType: paraEnum(perfil.skinType),
    skinPhototype: paraEnum(perfil.skinPhototype),
    skinSensitivity: paraEnum(perfil.skinSensitivity),
    scalpType: paraEnum(perfil.scalpType),
    isPregnant: perfil.isPregnant ?? undefined,
    acneProne: perfil.acneProne ?? undefined,
    hasRosacea: perfil.hasRosacea ?? undefined,
    hasEczema: perfil.hasEczema ?? undefined,
    hasHyperpigmentation: perfil.hasHyperpigmentation ?? undefined,
    hasMelasma: perfil.hasMelasma ?? undefined,
  };
}

async function enviar(
  caminho: string,
  metodo: string,
  corpo: Record<string, unknown>,
): Promise<void> {
  const resposta = await fetch(`${URL_API}${caminho}`, {
    method: metodo,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corpo),
  });

  if (!resposta.ok) {
    throw new Error(`A API respondeu ${resposta.status} em ${caminho}.`);
  }
}

export async function salvarPerfilNaApi(
  usuarioId: number,
  perfil: PerfilParaSalvar,
): Promise<void> {
  await enviar(
    `/api/user-profiles/${usuarioId}`,
    "PATCH",
    corpoDoPerfil(usuarioId, perfil),
  );

  await enviar(`/api/user-preferences/${usuarioId}`, "PUT", {
    userId: usuarioId,
    ...perfil.preferences,
  });

  
  for (const alergia of perfil.allergies) {
    await enviar("/api/user-allergies", "POST", {
      userId: usuarioId,
      allergyId: Number(alergia.allergyId),
      severity: paraEnum(alergia.severity),
    });
  }
}

