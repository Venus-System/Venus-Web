import { createWorker } from "tesseract.js";
import type { Worker } from "tesseract.js";
import { USAR_MOCK } from "../config/ambiente";
import type { TextoLido } from "../types/escanear";
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

function prepararParaLeitura(imagem: ImageBitmap): HTMLCanvasElement {
  const escala =
    Math.max(imagem.width, imagem.height) < LADO_MINIMO_PARA_LER ? 2 : 1;
  const canvas = document.createElement("canvas");

  canvas.width = Math.max(1, Math.floor(imagem.width * escala));
  canvas.height = Math.max(1, Math.floor(imagem.height * escala));

  const contexto = canvas.getContext("2d");

  if (contexto === null) {
    throw new Error("O navegador não conseguiu abrir a imagem.");
  }

  contexto.filter = "grayscale(1)";
  contexto.drawImage(imagem, 0, 0, canvas.width, canvas.height);

  return canvas;
}

function separarLinhas(texto: string): string[] {
  return texto
    .split("\n")
    .map((linha) => linha.trim())
    .filter((linha) => linha !== "");
}

export async function lerTextoDaImagem(arquivo: Blob): Promise<TextoLido> {
  if (USAR_MOCK) {
    await simularLatencia();

    return { fullText: textoLidoDoMock.join("\n"), lines: textoLidoDoMock };
  }

  let imagem: ImageBitmap | null = null;

  try {
    imagem = await createImageBitmap(arquivo);

    const { data } = await (await obterLeitor()).recognize(
      prepararParaLeitura(imagem),
    );
    const linhas = separarLinhas(data.text);

    return { fullText: linhas.join("\n"), lines: linhas };
  } catch {
    throw new Error(
      "Não foi possível ler esta imagem. Confira se é um arquivo JPG, PNG ou WebP e tente de novo.",
    );
  } finally {
    imagem?.close();
  }
}
