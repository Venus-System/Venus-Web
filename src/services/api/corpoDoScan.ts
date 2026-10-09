import type {
  LadoDoScan,
  QualidadeDaFoto,
  RascunhoDoScan,
  ScanEnviado,
} from "../../types/escanear";
import { comoObjeto, numero, texto } from "./leitura";

const VALIDADE_DA_ASSINATURA_EM_SEGUNDOS = 3300;
const TOLERANCIA_DO_RELOGIO_EM_SEGUNDOS = 300;
const STATUS_DA_QUALIDADE = ["PROCESSING", "COMPLETED", "FAILED", "PENDING_REVIEW"];

export interface AssinaturaApi {
  publicId: string;
  signature: string;
}

export interface AssinaturasApi {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  uploadPreset: string | null;
  type: string;
  overwrite: boolean;
  front: AssinaturaApi;
  back: AssinaturaApi;
}

export interface ImagemApi {
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export interface DispositivoApi {
  deviceId: string;
  platform: string;
  appVersion: string;
  model: string;
}

export interface CorpoDoScan {
  scanId: string;
  firebaseUid: string;
  device: DispositivoApi;
  startedAt: string;
  finishedAt: string;
  qualityCheck: QualidadeDaFoto;
  images: { front: ImagemApi; back: ImagemApi };
  ocr: {
    front: {
      fullText: string;
      lines: string[];
      extracted: { brand: string; productName: string };
    };
    back: {
      fullText: string;
      lines: string[];
      extracted: { ingredientsText: string };
    };
  };
  ingredients: { position: number; rawName: string }[];
}

export function publicIdDoLado(scanId: string, lado: LadoDoScan): string {
  return `scans/${scanId}/${lado}`;
}

function lerAssinatura(
  valor: unknown,
  scanId: string,
  lado: LadoDoScan,
): AssinaturaApi | null {
  const dados = comoObjeto(valor);
  const publicId = texto(dados.publicId);
  const signature = texto(dados.signature);

  return publicId === publicIdDoLado(scanId, lado) && signature !== null
    ? { publicId, signature }
    : null;
}

export function lerAssinaturas(
  valor: unknown,
  scanId: string,
  agoraEmSegundos: number,
): AssinaturasApi | null {
  const dados = comoObjeto(valor);
  const cloudName = texto(dados.cloudName);
  const apiKey = texto(dados.apiKey);
  const timestamp = numero(dados.timestamp);
  const type = texto(dados.type);
  const front = lerAssinatura(dados.front, scanId, "front");
  const back = lerAssinatura(dados.back, scanId, "back");

  if (
    cloudName === null ||
    apiKey === null ||
    type === null ||
    timestamp === null ||
    front === null ||
    back === null ||
    timestamp <= 0 ||
    timestamp < agoraEmSegundos - VALIDADE_DA_ASSINATURA_EM_SEGUNDOS ||
    timestamp > agoraEmSegundos + TOLERANCIA_DO_RELOGIO_EM_SEGUNDOS
  ) {
    return null;
  }

  return {
    cloudName,
    apiKey,
    timestamp,
    uploadPreset: texto(dados.uploadPreset),
    type,
    overwrite: dados.overwrite === true,
    front,
    back,
  };
}

export function formularioDoUpload(
  assinaturas: AssinaturasApi,
  lado: LadoDoScan,
  arquivo: Blob,
): FormData {
  const assinatura = assinaturas[lado];
  const formulario = new FormData();

  formulario.append("api_key", assinaturas.apiKey);
  formulario.append("timestamp", String(assinaturas.timestamp));
  formulario.append("signature", assinatura.signature);
  formulario.append("public_id", assinatura.publicId);
  formulario.append("type", assinaturas.type);
  formulario.append("overwrite", String(assinaturas.overwrite));

  if (assinaturas.uploadPreset !== null) {
    formulario.append("upload_preset", assinaturas.uploadPreset);
  }

  formulario.append("file", arquivo, `${lado}.photo`);

  return formulario;
}

export function lerRecibo(
  valor: unknown,
  assinaturas: AssinaturasApi,
  lado: LadoDoScan,
): ImagemApi | null {
  const dados = comoObjeto(valor);
  const publicId = texto(dados.public_id);
  const format = texto(dados.format);
  const width = numero(dados.width);
  const height = numero(dados.height);
  const bytes = numero(dados.bytes);
  const version = numero(dados.version);

  if (
    texto(dados.resource_type) !== "image" ||
    texto(dados.type) !== assinaturas.type ||
    publicId !== assinaturas[lado].publicId ||
    format === null ||
    !/^[a-zA-Z0-9]{1,10}$/.test(format) ||
    width === null ||
    width <= 0 ||
    height === null ||
    height <= 0 ||
    bytes === null ||
    bytes <= 0 ||
    version === null ||
    version <= 0
  ) {
    return null;
  }

  return { publicId, width, height, format, bytes };
}

export function montarCorpo(
  rascunho: RascunhoDoScan,
  firebaseUid: string,
  dispositivo: DispositivoApi,
  imagens: { front: ImagemApi; back: ImagemApi },
  qualidade: QualidadeDaFoto,
  finishedAt: string,
): CorpoDoScan {
  return {
    scanId: rascunho.scanId,
    firebaseUid,
    device: dispositivo,
    startedAt: rascunho.startedAt,
    finishedAt,
    qualityCheck: qualidade,
    images: imagens,
    ocr: {
      front: {
        fullText: rascunho.frente.fullText,
        lines: rascunho.frente.lines,
        extracted: {
          brand: rascunho.brand.trim(),
          productName: rascunho.productName.trim(),
        },
      },
      back: {
        fullText: rascunho.verso.fullText,
        lines: rascunho.verso.lines,
        extracted: { ingredientsText: rascunho.ingredientsText.trim() },
      },
    },
    ingredients: rascunho.ingredientes.map(({ position, rawName }) => ({
      position,
      rawName,
    })),
  };
}

function excede(valor: string, limite: number): boolean {
  return valor.length > limite;
}

function linhasInvalidas(linhas: string[]): boolean {
  return linhas.length > 500 || linhas.some((linha) => excede(linha, 1000));
}

function imagemInvalida(imagem: ImagemApi, scanId: string, lado: LadoDoScan): boolean {
  const esperado = publicIdDoLado(scanId, lado);

  return (
    (imagem.publicId !== esperado && !imagem.publicId.endsWith(`/${esperado}`)) ||
    imagem.width <= 0 ||
    imagem.height <= 0 ||
    imagem.bytes <= 0 ||
    imagem.format.trim() === "" ||
    excede(imagem.format, 10)
  );
}

export function validarCorpo(corpo: CorpoDoScan): string | null {
  const { ocr, ingredients, qualityCheck, device } = corpo;

  if (ocr.back.extracted.ingredientsText === "" || ingredients.length === 0) {
    return "A composição foi lida, mas nenhum ingrediente foi separado.";
  }

  if (ingredients.length > 200) {
    return "Limite de 200 ingredientes excedido.";
  }

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(
      corpo.scanId,
    )
  ) {
    return "Identificador do scan inválido.";
  }

  if (corpo.firebaseUid.trim() === "" || excede(corpo.firebaseUid, 128)) {
    return "Conta do Firebase inválida.";
  }

  if (
    [device.deviceId, device.platform, device.appVersion, device.model].some(
      (campo) => campo.trim() === "",
    )
  ) {
    return "Dados do aparelho ausentes.";
  }

  if (Date.parse(corpo.finishedAt) < Date.parse(corpo.startedAt)) {
    return "A data final do scan é anterior à inicial.";
  }

  if (
    !Number.isFinite(qualityCheck.blurScore) ||
    !Number.isFinite(qualityCheck.brightness) ||
    !STATUS_DA_QUALIDADE.includes(qualityCheck.status)
  ) {
    return "A avaliação de qualidade da foto é inválida.";
  }

  if (
    excede(ocr.front.fullText, 20000) ||
    excede(ocr.back.fullText, 20000) ||
    linhasInvalidas(ocr.front.lines) ||
    linhasInvalidas(ocr.back.lines)
  ) {
    return "O texto lido passou do limite aceito pela API.";
  }

  if (
    excede(ocr.front.extracted.brand, 2000) ||
    excede(ocr.front.extracted.productName, 2000) ||
    excede(ocr.back.extracted.ingredientsText, 20000)
  ) {
    return "Um dos campos passou do limite aceito pela API.";
  }

  const posicoes = new Set<number>();

  for (const { position, rawName } of ingredients) {
    if (position <= 0 || posicoes.has(position)) {
      return "Posição de ingrediente inválida ou repetida.";
    }

    posicoes.add(position);

    if (rawName.trim() === "" || excede(rawName, 300)) {
      return "Nome de ingrediente vazio ou comprido demais.";
    }
  }

  if (
    imagemInvalida(corpo.images.front, corpo.scanId, "front") ||
    imagemInvalida(corpo.images.back, corpo.scanId, "back")
  ) {
    return "A referência de uma das fotos não pertence a este scan.";
  }

  return null;
}

export function lerScanEnviado(valor: unknown, scanId: string): ScanEnviado | null {
  const dados = comoObjeto(valor);
  const id = texto(dados.id);
  const status = texto(dados.status);

  return id !== null && status !== null && texto(dados.scanId) === scanId
    ? { id, scanId, status }
    : null;
}
