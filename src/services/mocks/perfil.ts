import type { PerfilCarregado, PerfilParaSalvar } from "../../types/perfil";
import { guardar, ler } from "../../utils/armazenamento";
import { somentePreferenciasValidas } from "../../utils/preferencias";
import { lerFotoFalsa } from "./avatar";

const CHAVE_PERFIL = "venus.perfil";

function ehPerfilSalvo(valor: unknown): valor is PerfilParaSalvar {
  return (
    typeof valor === "object" &&
    valor !== null &&
    "preferences" in valor &&
    Array.isArray(valor.preferences) &&
    "allergies" in valor &&
    Array.isArray(valor.allergies)
  );
}

export function guardarPerfilFalso(perfil: PerfilParaSalvar): void {
  guardar(CHAVE_PERFIL, perfil);
}

export function lerPerfilFalso(): PerfilCarregado | null {
  const perfil = ler(CHAVE_PERFIL, ehPerfilSalvo);

  if (perfil === null) {
    return null;
  }

  return {
    perfil: {
      ...perfil,
      preferences: somentePreferenciasValidas(perfil.preferences),
    },
    accountStatus: "active",
    avatarUrl: lerFotoFalsa(),
  };
}
