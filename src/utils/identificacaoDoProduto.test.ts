import { describe, expect, it } from "vitest";
import { produtosMock, serumCalmanteAveia } from "../services/mocks/produtos";
import {
  CANDIDATOS_MOSTRADOS,
  candidatosDoCatalogo,
  temTextoLegivel,
} from "./identificacaoDoProduto";
import { TEXTO_DE_EXEMPLO } from "./imagemDeExemplo";

function slugs(linhas: string[]): string[] {
  return candidatosDoCatalogo(linhas, produtosMock).map((produto) => produto.slug);
}

describe("identificação do produto pela frente", () => {
  it("acha o produto do exemplo pela marca e pelo nome", () => {
    expect(slugs(TEXTO_DE_EXEMPLO.front)[0]).toBe("serum-calmante-aveia");
  });

  it("ignora acento, caixa e palavras curtas", () => {
    expect(slugs(["flora nativa", "SERUM calmante DE aveia"])[0]).toBe(
      "serum-calmante-aveia",
    );
  });

  it("acha pelo nome inteiro mesmo sem a marca", () => {
    expect(slugs(["Hidratante Facial com Ceramidas"])).toContain(
      "hidratante-facial-ceramidas",
    );
  });

  it("não acha nada só pela marca", () => {
    expect(slugs(["Flora Nativa"])).toEqual([]);
  });

  it("não acha nada num texto que não é do catálogo", () => {
    expect(slugs(["Chocolate ao leite", "90 g"])).toEqual([]);
  });

  it(`mostra no máximo ${CANDIDATOS_MOSTRADOS} candidatos`, () => {
    const repetidos = ["a", "b", "c", "d"].map((letra) => ({
      ...serumCalmanteAveia,
      slug: `serum-${letra}`,
    }));

    expect(
      candidatosDoCatalogo(TEXTO_DE_EXEMPLO.front, repetidos),
    ).toHaveLength(CANDIDATOS_MOSTRADOS);
  });
});

describe("texto legível", () => {
  it("recusa foto sem texto ou só com sinais e números", () => {
    expect(temTextoLegivel([])).toBe(false);
    expect(temTextoLegivel(["~ | .", "30 ml"])).toBe(false);
  });

  it("aceita quando há uma palavra de verdade", () => {
    expect(temTextoLegivel(["Flora"])).toBe(true);
  });
});
