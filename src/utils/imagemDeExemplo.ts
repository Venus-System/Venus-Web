import { USAR_MOCK } from "../config/ambiente";

export const TEXTO_DO_MOCK: string[] = [
  "Flora Nativa",
  "Sérum Calmante de Aveia",
  "30 ml",
  "INGREDIENTES: AQUA, GLYCERIN, NIACINAMIDE,",
  "AVENA SATIVA KERNEL EXTRACT, PANTHENOL, PHENOXYETHANOL.",
];

const TEXTO_DO_CATALOGO: string[] = ["CeraVe", "Loção Facial Hidratante Noite"];

const TEXTO_DE_EXEMPLO = USAR_MOCK ? TEXTO_DO_MOCK : TEXTO_DO_CATALOGO;

export const DESCRICAO_DO_EXEMPLO = USAR_MOCK
  ? "Imagem de exemplo com o rótulo do Sérum Calmante de Aveia, da Flora Nativa: a marca, o nome, o volume e a lista de ingredientes."
  : "Imagem de exemplo com a marca e o nome da Loção Facial Hidratante Noite, da CeraVe.";

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
