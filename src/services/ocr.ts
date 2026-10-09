import { createWorker } from "tesseract.js";
import type { Worker } from "tesseract.js";
import { USAR_MOCK } from "../config/ambiente";
import type { FotoLida, LadoDoScan } from "../types/escanear";
import { fatorDeReducao, medirQualidade } from "../utils/qualidadeDaFoto";
import { simularLatencia } from "./mocks/atraso";
import { textoLidoDoMock } from "./mocks/escanear";

const LADO_MINIMO_PARA_LER = 1500;

let leitor: Promise<Worker> | null = null;

function obterLeitor(): Promise<Worker> {
  if (leitor === null) {
    leitor = createWorker("eng").catch((erro: unknown) => {
      leitor = null;
      throw erro;
    });
  }

  return leitor;
}

function desenhar(
  imagem: ImageBitmap,
  escala: number,
  filtro: string,
): { canvas: HTMLCanvasElement; contexto: CanvasRenderingContext2D } {
  const canvas = document.createElement("canvas");

  canvas.width = Math.max(1, Math.floor(imagem.width * escala));
  canvas.height = Math.max(1, Math.floor(imagem.height * escala));

  const contexto = canvas.getContext("2d", { willReadFrequently: true });

  if (contexto === null) {
    throw new Error("O navegador não conseguiu abrir a foto.");
  }

  contexto.filter = filtro;
  contexto.drawImage(imagem, 0, 0, canvas.width, canvas.height);

  return { canvas, contexto };
}

function medirQualidadeDaImagem(imagem: ImageBitmap) {
  const fator = fatorDeReducao(imagem.width, imagem.height);
  const { canvas, contexto } = desenhar(imagem, 1 / fator, "none");

  return medirQualidade(
    contexto.getImageData(0, 0, canvas.width, canvas.height),
  );
}

function prepararParaLeitura(imagem: ImageBitmap): HTMLCanvasElement {
  const escala =
    Math.max(imagem.width, imagem.height) < LADO_MINIMO_PARA_LER ? 2 : 1;

  return desenhar(imagem, escala, "grayscale(1)").canvas;
}

function separarLinhas(texto: string): string[] {
  return texto
    .split("\n")
    .map((linha) => linha.trim())
    .filter((linha) => linha !== "");
}

export async function lerFotoDoScan(
  arquivo: Blob,
  lado: LadoDoScan,
): Promise<FotoLida> {
  let imagem: ImageBitmap | null = null;

  try {
    imagem = await createImageBitmap(arquivo);

    const qualidade = medirQualidadeDaImagem(imagem);

    if (USAR_MOCK) {
      await simularLatencia();

      const linhas = textoLidoDoMock[lado];

      return { arquivo, fullText: linhas.join("\n"), lines: linhas, qualidade };
    }

    const { data } = await (await obterLeitor()).recognize(
      prepararParaLeitura(imagem),
    );
    const linhas = separarLinhas(data.text);

    return { arquivo, fullText: linhas.join("\n"), lines: linhas, qualidade };
  } catch {
    throw new Error(
      "Não foi possível ler esta foto. Confira se é uma imagem JPG, PNG ou WebP e tente de novo.",
    );
  } finally {
    imagem?.close();
  }
}
