import type { AnaliseRecente } from "../types/painel";

function semAcento(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .trim()
    .toLowerCase();
}

export function filtrarAnalises(
  analises: AnaliseRecente[],
  termo: string,
): AnaliseRecente[] {
  const procurado = semAcento(termo);

  if (procurado === "") {
    return analises;
  }

  return analises.filter(
    (analise) =>
      semAcento(analise.product.name).includes(procurado) ||
      semAcento(analise.product.brandName).includes(procurado),
  );
}
