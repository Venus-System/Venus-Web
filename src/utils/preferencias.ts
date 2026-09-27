import type { Preferencia } from "../types/perfil";

const PREFERENCIAS: Preferencia[] = [
  "vegan",
  "crueltyFree",
  "parabenFree",
  "sulfateFree",
  "siliconeFree",
  "alcoholFree",
  "oilFree",
  "natural",
  "organic",
  "hypoallergenic",
  "nonComedogenic",
  "dermatologicallyTested",
  "recyclablePackaging",
];

export function somentePreferenciasValidas(valor: unknown[]): Preferencia[] {
  return PREFERENCIAS.filter((preferencia) => valor.includes(preferencia));
}
