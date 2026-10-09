import { guardar, ler } from "./armazenamento";

const CHAVE_IDS = "venus.idsDaApi";

type IdsPorUid = Record<string, number>;

function ehMapaDeIds(valor: unknown): valor is IdsPorUid {
  return (
    typeof valor === "object" &&
    valor !== null &&
    Object.values(valor).every((id) => typeof id === "number")
  );
}

export function lerIdDaApi(uid: string): number | null {
  const mapa = ler(CHAVE_IDS, ehMapaDeIds);

  if (mapa === null) {
    return null;
  }

  return mapa[uid] ?? null;
}

export function guardarIdDaApi(uid: string, id: number): void {
  const mapa = ler(CHAVE_IDS, ehMapaDeIds) ?? {};

  guardar(CHAVE_IDS, { ...mapa, [uid]: id });
}

export function esquecerIdDaApi(uid: string): void {
  const mapa = ler(CHAVE_IDS, ehMapaDeIds);

  if (mapa === null) {
    return;
  }

  const restante = { ...mapa };

  delete restante[uid];
  guardar(CHAVE_IDS, restante);
}
