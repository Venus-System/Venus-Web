export const TEXTO_DE_EXEMPLO: string[] = [
  "Flora Nativa",
  "Sérum Calmante de Aveia",
  "30 ml",
  "INGREDIENTES: AQUA, GLYCERIN, NIACINAMIDE,",
  "AVENA SATIVA KERNEL EXTRACT, PANTHENOL, PHENOXYETHANOL.",
];

export const DESCRICAO_DO_EXEMPLO =
  "Imagem de exemplo com o rótulo do Sérum Calmante de Aveia, da Flora Nativa: a marca, o nome, o volume e a lista de ingredientes.";

const LARGURA = 1400;
const ALTURA_DA_LINHA = 64;
const MARGEM = 72;

export function gerarImagemDeExemplo(): Promise<Blob> {
  const canvas = document.createElement("canvas");

  canvas.width = LARGURA;
  canvas.height = MARGEM * 2 + TEXTO_DE_EXEMPLO.length * ALTURA_DA_LINHA;

  const contexto = canvas.getContext("2d");

  if (contexto === null) {
    return Promise.reject(new Error("O navegador não conseguiu criar a imagem."));
  }

  contexto.fillStyle = "#efe9dd";
  contexto.fillRect(0, 0, canvas.width, canvas.height);
  contexto.fillStyle = "#1c1c1c";
  contexto.font = "40px Arial, sans-serif";
  contexto.textBaseline = "top";

  TEXTO_DE_EXEMPLO.forEach((linha, indice) => {
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
