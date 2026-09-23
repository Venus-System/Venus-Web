import { guardar, ler, limpar } from "../../utils/armazenamento";

const CHAVE_FOTO = "venus.fotoPerfil";

function ehTexto(valor: unknown): valor is string {
  return typeof valor === "string" && valor !== "";
}

export function guardarFotoFalsa(conteudo: string): void {
  guardar(CHAVE_FOTO, conteudo);
}

export function lerFotoFalsa(): string | null {
  return ler(CHAVE_FOTO, ehTexto);
}

export function limparFotoFalsa(): void {
  limpar(CHAVE_FOTO);
}
