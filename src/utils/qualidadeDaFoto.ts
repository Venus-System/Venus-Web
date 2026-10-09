import type { MotivoDeBloqueio, QualidadeDaFoto } from "../types/escanear";

export const LADO_MAXIMO_DA_ANALISE = 640;

const DESFOQUE_MAXIMO = 0.85;
const BRILHO_MINIMO = 0.08;
const BRILHO_MAXIMO = 0.95;

export interface PixelsDaFoto {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

export function fatorDeReducao(largura: number, altura: number): number {
  const maior = Math.max(largura, altura);
  let fator = 1;

  while (maior / fator > LADO_MAXIMO_DA_ANALISE) {
    fator *= 2;
  }

  return fator;
}

function cinza(pixels: PixelsDaFoto, x: number, y: number): number {
  const i = (y * pixels.width + x) * 4;

  return (
    (0.299 * pixels.data[i] +
      0.587 * pixels.data[i + 1] +
      0.114 * pixels.data[i + 2]) /
    255
  );
}

export function medirQualidade(pixels: PixelsDaFoto): QualidadeDaFoto {
  const { width: largura, height: altura } = pixels;

  if (largura < 16 || altura < 16) {
    throw new Error("Foto pequena demais.");
  }

  let soma = 0;
  let somaDosQuadrados = 0;
  let somaDoLaplaciano = 0;
  let quadradosDoLaplaciano = 0;
  let total = 0;
  let somaDaBorda = 0;
  let quadradosDaBorda = 0;
  let totalDaBorda = 0;
  let somaDoCentro = 0;
  let totalDoCentro = 0;

  for (let y = 1; y < altura - 1; y += 1) {
    for (let x = 1; x < largura - 1; x += 1) {
      const centro = cinza(pixels, x, y);
      const laplaciano =
        cinza(pixels, x - 1, y) +
        cinza(pixels, x + 1, y) +
        cinza(pixels, x, y - 1) +
        cinza(pixels, x, y + 1) -
        4 * centro;

      soma += centro;
      somaDosQuadrados += centro * centro;
      somaDoLaplaciano += laplaciano;
      quadradosDoLaplaciano += laplaciano * laplaciano;
      total += 1;

      const naBorda =
        x < largura * 0.12 ||
        x >= largura * 0.88 ||
        y < altura * 0.12 ||
        y >= altura * 0.88;

      if (naBorda) {
        somaDaBorda += centro;
        quadradosDaBorda += centro * centro;
        totalDaBorda += 1;
      } else {
        somaDoCentro += centro;
        totalDoCentro += 1;
      }
    }
  }

  const media = soma / total;
  const variancia = Math.max(0, somaDosQuadrados / total - media * media);
  const varianciaDoLaplaciano = Math.max(
    0,
    quadradosDoLaplaciano / total - (somaDoLaplaciano / total) ** 2,
  );
  const mediaDaBorda = somaDaBorda / Math.max(1, totalDaBorda);
  const varianciaDaBorda =
    totalDaBorda === 0
      ? 1
      : Math.max(0, quadradosDaBorda / totalDaBorda - mediaDaBorda ** 2);
  const mediaDoCentro =
    totalDoCentro === 0 ? media : somaDoCentro / totalDoCentro;

  return {
    blurScore: 1 / (1 + varianciaDoLaplaciano / 0.0025),
    brightness: media,
    backgroundOk:
      varianciaDaBorda < 0.055 &&
      Math.abs(mediaDaBorda - mediaDoCentro) < 0.45 &&
      variancia > 0.002,
    status: "COMPLETED",
  };
}

export function juntarQualidades(
  frente: QualidadeDaFoto,
  verso: QualidadeDaFoto,
): QualidadeDaFoto {
  return {
    blurScore: Math.max(frente.blurScore, verso.blurScore),
    brightness: (frente.brightness + verso.brightness) / 2,
    backgroundOk: frente.backgroundOk && verso.backgroundOk,
    status: "COMPLETED",
  };
}

export function motivoDoBloqueio(
  qualidade: QualidadeDaFoto,
): MotivoDeBloqueio | null {
  if (qualidade.blurScore >= DESFOQUE_MAXIMO) {
    return "BLUR_TOO_HIGH";
  }

  if (qualidade.brightness < BRILHO_MINIMO) {
    return "TOO_DARK";
  }

  if (qualidade.brightness > BRILHO_MAXIMO) {
    return "TOO_BRIGHT";
  }

  return null;
}
