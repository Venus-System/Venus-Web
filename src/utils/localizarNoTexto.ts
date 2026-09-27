import type { LadoEmbalagem, TrechoNoTexto } from "../types/admin";

function escaparParaBusca(trecho: string): string {
  return trecho.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function localizarNoTexto(
  textos: Record<LadoEmbalagem, string>,
  nomeLido: string,
): TrechoNoTexto | null {
  const partes = nomeLido.split(/\s+/).filter((parte) => parte !== "");

  if (partes.length === 0) {
    return null;
  }

  const padrao = new RegExp(partes.map(escaparParaBusca).join("\\s+"), "i");
  const lados: LadoEmbalagem[] = ["back", "front"];

  for (const lado of lados) {
    const achado = padrao.exec(textos[lado]);

    if (achado !== null) {
      return {
        side: lado,
        start: achado.index,
        end: achado.index + achado[0].length,
      };
    }
  }

  return null;
}
