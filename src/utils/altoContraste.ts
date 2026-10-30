import { guardar, ler } from "./armazenamento";

const CHAVE_DO_CONTRASTE = "venus.altoContraste";

function ehBooleano(valor: unknown): valor is boolean {
  return typeof valor === "boolean";
}

export function lerAltoContraste(): boolean {
  return ler(CHAVE_DO_CONTRASTE, ehBooleano) ?? false;
}

export function aplicarAltoContraste(ativo: boolean): void {
  if (ativo) {
    document.documentElement.dataset.contraste = "alto";
    return;
  }

  delete document.documentElement.dataset.contraste;
}

export function guardarAltoContraste(ativo: boolean): void {
  guardar(CHAVE_DO_CONTRASTE, ativo);
  aplicarAltoContraste(ativo);
}
