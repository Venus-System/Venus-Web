import { describe, expect, it } from "vitest";
import type { RascunhoDoScan } from "../../types/escanear";
import {
  formularioDoUpload,
  lerAssinaturas,
  lerRecibo,
  lerScanEnviado,
  montarCorpo,
  validarCorpo,
} from "./corpoDoScan";
import type { AssinaturasApi, ImagemApi } from "./corpoDoScan";

const SCAN_ID = "8d3f2c1a-4b5e-4f6a-9c7d-1e2f3a4b5c6d";
const AGORA = 1_760_000_000;

const respostaDasAssinaturas = {
  cloudName: "venus",
  apiKey: "123",
  timestamp: AGORA,
  uploadPreset: null,
  type: "private",
  overwrite: true,
  front: { publicId: `scans/${SCAN_ID}/front`, signature: "assinatura-frente" },
  back: { publicId: `scans/${SCAN_ID}/back`, signature: "assinatura-verso" },
};

function assinaturas(): AssinaturasApi {
  const lidas = lerAssinaturas(respostaDasAssinaturas, SCAN_ID, AGORA);

  if (lidas === null) {
    throw new Error("as assinaturas de teste deveriam ser válidas");
  }

  return lidas;
}

function imagem(lado: "front" | "back"): ImagemApi {
  return {
    publicId: `scans/${SCAN_ID}/${lado}`,
    width: 1200,
    height: 1600,
    format: "jpg",
    bytes: 2048,
  };
}

const qualidade = {
  blurScore: 0.2,
  brightness: 0.5,
  backgroundOk: true,
  status: "COMPLETED" as const,
};

const rascunho: RascunhoDoScan = {
  scanId: SCAN_ID,
  startedAt: "2026-10-09T12:00:00.000Z",
  frente: {
    arquivo: new Blob(["frente"]),
    fullText: "Flora Nativa\nSérum Calmante",
    lines: ["Flora Nativa", "Sérum Calmante"],
    qualidade,
  },
  verso: {
    arquivo: new Blob(["verso"]),
    fullText: "INGREDIENTES: AQUA, GLYCERIN.",
    lines: ["INGREDIENTES: AQUA, GLYCERIN."],
    qualidade,
  },
  productName: " Sérum Calmante ",
  brand: " Flora Nativa ",
  ingredientsText: "AQUA, GLYCERIN",
  ingredientes: [
    { position: 1, rawName: "AQUA", looksLikePackaging: false },
    { position: 2, rawName: "GLYCERIN", looksLikePackaging: false },
  ],
  usouExemplo: false,
};

const dispositivo = {
  deviceId: "instalacao",
  platform: "web",
  appVersion: "0.1.0",
  model: "navegador",
};

function corpo() {
  return montarCorpo(
    rascunho,
    "uid-do-firebase",
    dispositivo,
    { front: imagem("front"), back: imagem("back") },
    qualidade,
    "2026-10-09T12:05:00.000Z",
  );
}

describe("assinaturas, como o CloudinaryUploadClient do app confere", () => {
  it("aceita assinaturas do scan certo e dentro do prazo", () => {
    expect(assinaturas().front.signature).toBe("assinatura-frente");
  });

  it("recusa assinatura de outro scan", () => {
    expect(lerAssinaturas(respostaDasAssinaturas, crypto.randomUUID(), AGORA)).toBeNull();
  });

  it("recusa assinatura vencida ou do futuro", () => {
    expect(lerAssinaturas(respostaDasAssinaturas, SCAN_ID, AGORA + 3301)).toBeNull();
    expect(lerAssinaturas(respostaDasAssinaturas, SCAN_ID, AGORA - 301)).toBeNull();
  });

  it("monta o formulário com os mesmos campos do app", () => {
    const formulario = formularioDoUpload(assinaturas(), "back", new Blob(["x"]));

    expect(formulario.get("api_key")).toBe("123");
    expect(formulario.get("timestamp")).toBe(String(AGORA));
    expect(formulario.get("signature")).toBe("assinatura-verso");
    expect(formulario.get("public_id")).toBe(`scans/${SCAN_ID}/back`);
    expect(formulario.get("type")).toBe("private");
    expect(formulario.get("overwrite")).toBe("true");
    expect(formulario.has("upload_preset")).toBe(false);
    expect(formulario.has("file")).toBe(true);
  });
});

describe("recibo do Cloudinary, como o ScanUploadedPhoto do app confere", () => {
  const recibo = {
    public_id: `scans/${SCAN_ID}/front`,
    resource_type: "image",
    type: "private",
    format: "jpg",
    width: 1200,
    height: 1600,
    bytes: 2048,
    version: 1,
  };

  it("aceita o recibo do lado certo", () => {
    expect(lerRecibo(recibo, assinaturas(), "front")).toEqual(imagem("front"));
  });

  it("recusa recibo de outro lado, de outro tipo ou sem tamanho", () => {
    expect(lerRecibo(recibo, assinaturas(), "back")).toBeNull();
    expect(lerRecibo({ ...recibo, resource_type: "video" }, assinaturas(), "front")).toBeNull();
    expect(lerRecibo({ ...recibo, bytes: 0 }, assinaturas(), "front")).toBeNull();
  });
});

describe("corpo do envio, como o ScanSubmissionMapper do app monta", () => {
  it("põe nome e marca onde o app põe o palpite da frente", () => {
    expect(corpo().ocr.front.extracted).toEqual({
      brand: "Flora Nativa",
      productName: "Sérum Calmante",
    });
  });

  it("manda o texto bruto dos dois lados e a composição revisada", () => {
    const { ocr } = corpo();

    expect(ocr.front.lines).toEqual(["Flora Nativa", "Sérum Calmante"]);
    expect(ocr.back.fullText).toBe("INGREDIENTES: AQUA, GLYCERIN.");
    expect(ocr.back.extracted.ingredientsText).toBe("AQUA, GLYCERIN");
  });

  it("manda só posição e nome de cada ingrediente", () => {
    expect(corpo().ingredients).toEqual([
      { position: 1, rawName: "AQUA" },
      { position: 2, rawName: "GLYCERIN" },
    ]);
  });

  it("passa na validação do app", () => {
    expect(validarCorpo(corpo())).toBeNull();
  });
});

describe("validação, como o ScanSubmissionValidator do app", () => {
  it("recusa composição vazia", () => {
    expect(validarCorpo({ ...corpo(), ingredients: [] })).not.toBeNull();
  });

  it("recusa posição repetida", () => {
    expect(
      validarCorpo({
        ...corpo(),
        ingredients: [
          { position: 1, rawName: "AQUA" },
          { position: 1, rawName: "GLYCERIN" },
        ],
      }),
    ).not.toBeNull();
  });

  it("recusa data final anterior à inicial", () => {
    expect(
      validarCorpo({ ...corpo(), finishedAt: "2026-10-09T11:00:00.000Z" }),
    ).not.toBeNull();
  });

  it("recusa foto de outro scan", () => {
    expect(
      validarCorpo({
        ...corpo(),
        images: { front: imagem("back"), back: imagem("back") },
      }),
    ).not.toBeNull();
  });

  it("recusa mais de 500 linhas lidas", () => {
    const { ocr } = corpo();

    expect(
      validarCorpo({
        ...corpo(),
        ocr: { ...ocr, back: { ...ocr.back, lines: Array(501).fill("x") } },
      }),
    ).not.toBeNull();
  });
});

describe("resposta do envio", () => {
  it("aceita a resposta do mesmo scan", () => {
    expect(
      lerScanEnviado({ id: "abc", scanId: SCAN_ID, status: "PENDING_REVIEW" }, SCAN_ID),
    ).toEqual({ id: "abc", scanId: SCAN_ID, status: "PENDING_REVIEW" });
  });

  it("recusa a resposta de outro scan", () => {
    expect(
      lerScanEnviado({ id: "abc", scanId: "outro", status: "PENDING_REVIEW" }, SCAN_ID),
    ).toBeNull();
  });
});
