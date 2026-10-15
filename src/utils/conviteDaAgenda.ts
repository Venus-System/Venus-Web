import { guardar, ler } from "./armazenamento";

const PREFIXO = "venus.conviteDaAgendaFechado.";

function ehBooleano(valor: unknown): valor is boolean {
  return typeof valor === "boolean";
}

export function conviteFechado(usuarioId: string): boolean {
  return ler(`${PREFIXO}${usuarioId}`, ehBooleano) ?? false;
}

export function guardarConviteFechado(usuarioId: string): void {
  guardar(`${PREFIXO}${usuarioId}`, true);
}
