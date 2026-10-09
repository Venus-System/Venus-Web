import { describe, expect, it } from "vitest";
import {
  localizarIngredientes,
  montarListaDeIngredientes,
  validarLista,
} from "./leituraDoRotulo";

function ler(linhas: string[]) {
  const trecho = localizarIngredientes(linhas);
  const lista = montarListaDeIngredientes(trecho.texto);

  return {
    trecho,
    lista,
    nomes: lista.map((item) => item.rawName),
  };
}

function preservadoParaRevisao(linhas: string[]): void {
  const { trecho, lista } = ler(linhas);

  expect(validarLista(trecho.texto, lista)).toBeNull();
}

describe("fim da lista, como no ScanBackExtractorInstrumentedTest do app", () => {
  it("deixa o contato depois de QUESTIONS fora da lista", () => {
    const { trecho, lista } = ler([
      "INGREDIENTS: AQUA, PARFUM",
      "QUESTIONS SUPPORT@MYSPRAYGROUP OR CALL 0800 123 4567",
    ]);

    expect(trecho.encontrado).toBe(true);
    expect(lista).toHaveLength(2);
  });

  it("para no lote", () => {
    expect(ler(["INGREDIENTS: AQUA, PARFUM", "LOT: ABC123"]).nomes).toEqual([
      "AQUA",
      "PARFUM",
    ]);
  });

  it("para no conteúdo e no telefone", () => {
    expect(
      ler(["INGREDIENTES: AQUA, PARFUM", "CONTEUDO: 150 ML", "TEL: 33334444"])
        .nomes,
    ).toEqual(["AQUA", "PARFUM"]);
  });

  it.each([
    "PROCURAR ORIENTAÇÃO MEDICA",
    "SE OCORRER ALERGIA, SUSPENDER",
    "NÃO CONTÉM CFC",
    "SSO DE 15OM S WS VENDIDO DO MERCADO DE DESODORANTES NO BRASL",
  ])("para antes do aviso ou da propaganda: %s", (aviso) => {
    const { lista } = ler(["INGREDIENTES: AQUA, PARFUM", aviso, "OUTRA FRASE"]);

    expect(lista).toHaveLength(2);
    expect(lista[1].rawName).toBe("PARFUM");
  });

  it("para no aviso que vem na mesma linha do título", () => {
    expect(
      ler(["INGREDIENTES: AQUA, PARFUM. PROCURAR ORIENTAÇÃO MEDICA", "OUTRA FRASE"])
        .lista,
    ).toHaveLength(2);
  });

  it("mantém a grafia que o OCR leu, sem corrigir", () => {
    expect(ler(["INGREDIENTES: AQUA, AUIOATE, 0CTYLDODECAN"]).nomes).toEqual([
      "AQUA",
      "AUIOATE",
      "0CTYLDODECAN",
    ]);
  });

  it("não para em pontos do OCR, só no site", () => {
    const { trecho, nomes } = ler([
      "INGREDIENTES: BUTANE, ISOBUTANE, PROPANE, PPG-14 BUTL ETE,",
      "CYCLOPENTASILOXANE.ALUMINUM SESQUICHLOROHYDRATE, PARFUM,",
      "GLYCINE, AQUA, CALCIUM CHLORIDE,",
      "DIMETHICONOL, HEXYL CINNAMAL, LIMONENE.",
      "www.example.com.br",
      "TEXTO ADMINISTRATIVO",
    ]);

    expect(trecho.texto).toContain("CYCLOPENTASILOXANE.ALUMINUM");
    expect(nomes).toContain("GLYCINE");
    expect(nomes).toContain("LIMONENE");
    expect(nomes.length).toBeGreaterThan(4);
    expect(trecho.texto).not.toContain("example");
    expect(trecho.texto).not.toContain("ADMINISTRATIVO");
  });

  it("não confunde texto com ponto com um site", () => {
    const { trecho, nomes } = ler([
      "INGREDIENTES: AQUA, XANTHAM.GUN, AUIOATE.OCTYLDODECAN,",
      "PARFUM, LIMONENE",
    ]);

    expect(trecho.texto).toContain("XANTHAM.GUN");
    expect(trecho.texto).toContain("AUIOATE.OCTYLDODECAN");
    expect(nomes.some((nome) => nome.includes("XANTHAM"))).toBe(true);
    expect(nomes.some((nome) => nome.includes("AUIOATE"))).toBe(true);
    expect(nomes).toContain("LIMONENE");
  });

  it.each([
    "www.example.com.br",
    "https://example.beauty/info",
    "http://example.org",
    "example.com",
    "example.com.br",
    "example.net",
    "www.example.beauty",
  ])("para no site: %s", (site) => {
    expect(
      ler(["INGREDIENTES: AQUA, PARFUM", site, "TEXTO ADMINISTRATIVO"]).nomes,
    ).toEqual(["AQUA", "PARFUM"]);
  });

  it.each([
    "www.example.com.br",
    "https://example.beauty",
    "example.com",
    "SITE: www.example.com.br",
  ])("mantém o que vem antes do site na mesma linha: %s", (site) => {
    expect(
      ler([
        "INGREDIENTES: AQUA, PARFUM",
        `DIMETHICONOL, LIMONENE. ${site}`,
        "TEXTO ADMINISTRATIVO",
      ]).trecho.texto,
    ).toBe("AQUA, PARFUM DIMETHICONOL, LIMONENE");
  });

  it("mantém os ingredientes quando o site está na linha do título", () => {
    expect(
      ler(["INGREDIENTES: AQUA, PARFUM. www.example.com", "TEXTO ADMINISTRATIVO"])
        .nomes,
    ).toEqual(["AQUA", "PARFUM"]);
  });

  it("lê a captura de 29/09 com o título estragado pelo OCR", () => {
    const { trecho, nomes } = ler([
      "NGREOIENTES: BUTANE, ISOBUTANE, PROPANE, PPG-14 BUTL ETE",
      "DO.OPENTASILOXANE, ALUMINUM SESQUICHLOROHYDRATE, PARIN",
      "EJANTHUS ANNUUS SEED OIL. DISTEARDIMONIUM HECTORITE CI2494",
      "tOATE, GLYCINE, AQUA, CALCIUM CHLORIDE, 0CTYLDODECANO, MI",
      "ROPYLENE CARBONATE, DIMETHICONOL, ALPHA-ISOMETHYL ONN",
      "INIO, HEXYL CINNAMAL, LIMONENE.",
      "Y33824C",
      "WOFENSNO",
      "Onilevew",
      "69657381",
    ]);

    expect(trecho.texto).toContain("DO.OPENTASILOXANE");
    expect(trecho.texto).toContain("ALPHA-ISOMETHYL ONN");
    expect(nomes).toContain("GLYCINE");
    expect(nomes).toContain("DIMETHICONOL");
    expect(nomes).toContain("LIMONENE");
    expect(nomes.length).toBeGreaterThan(4);
  });

  it("retoma a lista depois de uma coluna de propaganda no meio", () => {
    const { trecho, nomes } = ler([
      "INGREDIENTES: BUTANE, ISOBUTANE, PROPANE, PPG-14 BUTL ETE",
      "WAS VENDIDO DO MERCADO DE DESODORANTES NO BRASIL",
      "DO.OPENTASILOXANE, ALUMINUM SESQUICHLOROHYDRATE, PARIN",
      "EJANTHUS ANNUUS SEED OIL, GLYCINE, AQUA, CALCIUM CHLORIDE",
      "DIMETHICONOL, ALPHA-ISOMETHYL IONONE, HEXYL CINNAMAL, LIMONENE.",
      "Y33824C",
    ]);

    expect(trecho.texto).toContain("DO.OPENTASILOXANE");
    expect(trecho.texto).toContain("DIMETHICONOL");
    expect(nomes).toContain("LIMONENE");
    expect(nomes.length).toBeGreaterThan(4);
    expect(trecho.texto).not.toContain("MERCADO DE DESODORANTES");
  });
});

describe("separação, como no ScanIngredientNormalizerTest do app", () => {
  it.each([
    "CHA16AO YOINE",
    "DISTEARDIMONIUM HECTORITE CH4M HGPLENE CARBONATE",
    "PANR Z4C NUUS SEED OIL",
    "ALPHA-ISOMETHIL HEXYL CINNAMAL",
    "PPG-14 BUTN EN RIUS ANINUUS SEED OIL",
    "0CTYLDO0ECAKL LENE CARBONATE",
  ])("nunca reconstrói um trecho ambíguo: %s", (fragmento) => {
    const linhas = [`INGREDIENTES: AQUA, ${fragmento}`];

    expect(ler(linhas).nomes).toContain(fragmento);
    preservadoParaRevisao(linhas);
  });

  it("mantém nomes com número e trechos desconhecidos", () => {
    const linhas = [
      "INGREDIENTES: PPG-14 BUTYL ETHER, C12-15 ALKYL BENZOATE, CI 77491, PEG-40 TEST",
    ];
    const { nomes } = ler(linhas);

    expect(nomes).toContain("PPG-14 BUTYL ETHER");
    expect(nomes).toContain("C12-15 ALKYL BENZOATE");
    expect(nomes).toContain("CI 77491");
    expect(nomes).toContain("PEG-40 TEST");
    preservadoParaRevisao(linhas);
  });

  it("só para no código da embalagem quando ele fecha o rótulo", () => {
    const fechado = ler(["INGREDIENTES: AQUA, LIMONENE.", "S2ACG", "657381"]);

    expect(fechado.nomes).toEqual(["AQUA", "LIMONENE"]);
    expect(fechado.trecho.texto).not.toContain("S2ACG");

    const continua = ler(["INGREDIENTES: LIMONENE.", "S2ACG", "GLYCINE, AQUA"]);

    expect(continua.trecho.texto).toContain("S2ACG");
    expect(continua.trecho.texto).toContain("GLYCINE");
    preservadoParaRevisao(["INGREDIENTES: LIMONENE.", "S2ACG", "GLYCINE, AQUA"]);
  });

  it("não some com número dentro da composição e junta o código de cor", () => {
    const linhas = ["INGREDIENTES: AQUA, 657381, CI, 77491"];
    const { nomes } = ler(linhas);

    expect(nomes).toContain("657381");
    expect(nomes).toContain("CI 77491");
    preservadoParaRevisao(linhas);
  });

  it("preserva a captura de 01/10 sem título para revisão", () => {
    const linhas = [
      "HOTES; BUTANE, ISOBUTANE, PROPANE, PPG-14 BUTY",
      "FoTASILOXANE, ALUMINUM SESQUICHLOROHYDRATE PAA",
      "iNSANNUUS SEED OIL, DISTEARDIMONIUM HECTORITE CI6A",
      "CARHONATE, DIMETHICONOL, ALPHA-ISOMETHYL N",
      "AQUA, CALCIUM CHLORIDE, OCTYLDO0ECAML M",
      "OL LCiNNAMAL, LIMONENE.",
      "S2ACG",
      "657381",
    ];
    const { trecho, nomes } = ler(linhas);

    expect(trecho.texto).toContain("PPG-14 BUTY FoTASILOXANE");
    expect(trecho.texto).not.toContain("S2ACG");
    expect(nomes).not.toContain("PPG-14 BUTYL ETHER");
    preservadoParaRevisao(linhas);
  });

  it("não inventa ingredientes na segunda captura de 01/10", () => {
    const { trecho, nomes } = ler([
      "NREDIENTES: BUTANE, ISOBUTANE, PROPANE, PPG-14 8UN N",
      "AHTIHUS ANNUUS SEED OIL. DISTEARDIMONIUM HECTORITE CAMA",
      "OOPENTASILOXANE, ALUMINUM SESOLUICHLOROHYDRAIE",
      "HEXYL CINNAMAL, LIMONENE.",
      "OATE, GLYCINE, AQUA, CALCIUM CHLORIDE, 0CTYLDOOECAMA",
      "PLENE CARBONATE, DIMETHICONOL. AL PHA ISOMETIHH",
      "AT3332 4G",
      "Unilevev",
      "6657381",
    ]);

    expect(trecho.texto).toContain("GLYCINE");
    expect(trecho.texto).toContain("OOPENTASILOXANE");
    expect(nomes.join(",")).not.toContain("OCYCLOPENTASILOXANE");
    expect(nomes).not.toContain("C12-15 ALKYL BENZOATE");
  });
});

describe("revisão no web", () => {
  it("marca texto de embalagem em vez de apagar", () => {
    const lista = montarListaDeIngredientes("AQUA, LOTE 123, GLYCERIN");

    expect(lista.map((item) => item.rawName)).toEqual([
      "AQUA",
      "LOTE 123",
      "GLYCERIN",
    ]);
    expect(lista.map((item) => item.looksLikePackaging)).toEqual([
      false,
      true,
      false,
    ]);
  });

  it("deixa a vírgula perdida na quebra de linha para a revisão", () => {
    expect(ler(["INGREDIENTES: AQUA, PARFUM", "LIMONENE"]).nomes).toEqual([
      "AQUA",
      "PARFUM LIMONENE",
    ]);
  });

  it("numera os ingredientes na ordem do trecho, a partir de 1", () => {
    expect(
      montarListaDeIngredientes("AQUA, GLYCERIN; PARFUM").map(
        (item) => item.position,
      ),
    ).toEqual([1, 2, 3]);
  });

  it("recusa a lista vazia e o nome comprido demais", () => {
    expect(validarLista("", [])).not.toBeNull();
    expect(
      validarLista("x", [
        { position: 1, rawName: "A".repeat(301), looksLikePackaging: false },
      ]),
    ).not.toBeNull();
  });

  it("não acha lista quando o texto não tem nada de composição", () => {
    expect(localizarIngredientes(["Modo de uso: aplique no rosto"]).encontrado).toBe(
      false,
    );
  });
});
