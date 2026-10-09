import type { LadoDoScan } from "../types/escanear";

export const TEXTO_DE_EXEMPLO: Record<LadoDoScan, string[]> = {
  front: ["Flora Nativa", "Sérum Calmante de Aveia", "30 ml"],
  back: [
    "INGREDIENTES: AQUA, GLYCERIN, NIACINAMIDE,",
    "AVENA SATIVA KERNEL EXTRACT, PANTHENOL,",
    "PHENOXYETHANOL.",
    "MODO DE USO: aplique no rosto limpo, pela manhã e à noite.",
    "Indústria Brasileira",
  ],
};

const LARGURA = 1400;
const ALTURA_DA_LINHA = 64;
const MARGEM = 72;

export function gerarImagemDeExemplo(lado: LadoDoScan): Promise<Blob> {
  const linhas = TEXTO_DE_EXEMPLO[lado];
  const canvas = document.createElement("canvas");

  canvas.width = LARGURA;
  canvas.height = MARGEM * 2 + linhas.length * ALTURA_DA_LINHA;

  const contexto = canvas.getContext("2d");

  if (contexto === null) {
    return Promise.reject(new Error("O navegador não conseguiu criar a imagem."));
  }

  contexto.fillStyle = "#efe9dd";
  contexto.fillRect(0, 0, canvas.width, canvas.height);
  contexto.fillStyle = "#1c1c1c";
  contexto.font = "40px Arial, sans-serif";
  contexto.textBaseline = "top";

  linhas.forEach((linha, indice) => {
    contexto.fillText(linha, MARGEM, MARGEM + indice * ALTURA_DA_LINHA);
  });

  return new Promise((resolver, rejeitar) => {
    canvas.toBlob((imagem) => {
      if (imagem === null) {
        rejeitar(new Error("O navegador não conseguiu criar a imagem."));
        return;
      }

      resolver(imagem);
    }, "image/png");
  });
}
