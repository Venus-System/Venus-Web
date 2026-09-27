import type { OpcaoDoCatalogo } from "../types/admin";
import { paraSlug } from "./paraSlug";

export function sugerirDoCatalogo(
  opcoes: OpcaoDoCatalogo[],
  lido: string,
): string {
  const procurado = paraSlug(lido);
  const encontrada = opcoes.find((opcao) => paraSlug(opcao.name) === procurado);

  return encontrada === undefined ? "" : String(encontrada.id);
}
