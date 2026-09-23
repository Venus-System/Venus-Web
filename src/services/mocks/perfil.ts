import type { PerfilCarregado, PerfilParaSalvar } from "../../types/perfil";
import { guardar, ler } from "../../utils/armazenamento";

const CHAVE_PERFIL = "venus.perfil";

function ehPerfilSalvo(valor: unknown): valor is PerfilParaSalvar {
  return (
    typeof valor === "object" &&
    valor !== null &&
    "preferences" in valor &&
    typeof valor.preferences === "object" &&
    valor.preferences !== null &&
    "allergies" in valor &&
    Array.isArray(valor.allergies)
  );
}

export function guardarPerfilFalso(perfil: PerfilParaSalvar): void {
  guardar(CHAVE_PERFIL, perfil);
}

export function lerPerfilFalso(): PerfilCarregado | null {
  const perfil = ler(CHAVE_PERFIL, ehPerfilSalvo);

  return perfil === null ? null : { perfil, accountStatus: "active" };
}
