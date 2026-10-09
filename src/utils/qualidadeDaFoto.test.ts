import { describe, expect, it } from "vitest";
import {
  fatorDeReducao,
  juntarQualidades,
  medirQualidade,
  motivoDoBloqueio,
} from "./qualidadeDaFoto";
import type { PixelsDaFoto } from "./qualidadeDaFoto";

function foto(
  lado: number,
  tom: (x: number, y: number) => number,
): PixelsDaFoto {
  const data = new Uint8ClampedArray(lado * lado * 4);

  for (let y = 0; y < lado; y += 1) {
    for (let x = 0; x < lado; x += 1) {
      const i = (y * lado + x) * 4;
      const valor = tom(x, y);

      data[i] = valor;
      data[i + 1] = valor;
      data[i + 2] = valor;
      data[i + 3] = 255;
    }
  }

  return { width: lado, height: lado, data };
}

const xadrez = (claro: number, escuro: number) => (x: number, y: number) =>
  (x + y) % 2 === 0 ? claro : escuro;

describe("qualidade da foto, com as fórmulas do ScanPhotoQualityAnalyzer do app", () => {
  it("reduz a foto em potências de 2 até caber em 640 px", () => {
    expect(fatorDeReducao(640, 480)).toBe(1);
    expect(fatorDeReducao(1280, 960)).toBe(2);
    expect(fatorDeReducao(4000, 3000)).toBe(8);
  });

  it("acusa desfoque numa foto lisa, sem nenhuma borda", () => {
    const qualidade = medirQualidade(foto(32, () => 128));

    expect(qualidade.blurScore).toBe(1);
    expect(qualidade.brightness).toBeCloseTo(128 / 255, 5);
    expect(motivoDoBloqueio(qualidade)).toBe("BLUR_TOO_HIGH");
  });

  it("aceita uma foto com bordas nítidas e brilho médio", () => {
    const qualidade = medirQualidade(foto(32, xadrez(255, 0)));

    expect(qualidade.blurScore).toBeLessThan(0.85);
    expect(qualidade.brightness).toBeCloseTo(0.5, 1);
    expect(qualidade.status).toBe("COMPLETED");
    expect(motivoDoBloqueio(qualidade)).toBeNull();
  });

  it("acusa foto escura demais", () => {
    expect(motivoDoBloqueio(medirQualidade(foto(32, xadrez(30, 0))))).toBe(
      "TOO_DARK",
    );
  });

  it("acusa foto clara demais", () => {
    expect(motivoDoBloqueio(medirQualidade(foto(32, xadrez(255, 230))))).toBe(
      "TOO_BRIGHT",
    );
  });

  it("recusa foto menor que 16 px", () => {
    expect(() => medirQualidade(foto(8, () => 128))).toThrow();
  });

  it("junta frente e verso como o app: pior desfoque, brilho médio", () => {
    const junta = juntarQualidades(
      { blurScore: 0.2, brightness: 0.4, backgroundOk: true, status: "COMPLETED" },
      { blurScore: 0.6, brightness: 0.6, backgroundOk: false, status: "COMPLETED" },
    );

    expect(junta).toEqual({
      blurScore: 0.6,
      brightness: 0.5,
      backgroundOk: false,
      status: "COMPLETED",
    });
  });
});
