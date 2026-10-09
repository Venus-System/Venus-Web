import { URL_API_SCANS } from "../../config/ambiente";
import type { LadoDoScan, ScanEnviado } from "../../types/escanear";
import { ErroDeOrientacao } from "../erros";
import {
  formularioDoUpload,
  lerAssinaturas,
  lerRecibo,
  lerScanEnviado,
} from "./corpoDoScan";
import type { AssinaturasApi, CorpoDoScan, ImagemApi } from "./corpoDoScan";
import { pedir, verificarResposta } from "./requisicao";

const CONTA_SEM_PERMISSAO =
  "Sua conta ainda não está liberada para enviar produtos. Saia e entre de novo; se continuar, fale com a equipe Venus.";

function segundosDeAgora(): number {
  return Math.floor(Date.now() / 1000);
}

export async function buscarAssinaturasNaApi(
  scanId: string,
): Promise<AssinaturasApi> {
  const caminho = "/api/scan-sessions/upload-signatures";
  const resposta = await pedir(
    `${URL_API_SCANS}${caminho}?scanId=${encodeURIComponent(scanId)}`,
  );

  if (resposta.status === 403) {
    throw new ErroDeOrientacao(CONTA_SEM_PERMISSAO);
  }

  verificarResposta(resposta, caminho);

  const assinaturas = lerAssinaturas(
    await resposta.json(),
    scanId,
    segundosDeAgora(),
  );

  if (assinaturas === null) {
    throw new Error("As assinaturas das fotos vieram incompletas ou vencidas.");
  }

  return assinaturas;
}

export async function subirFotoNoCloudinary(
  assinaturas: AssinaturasApi,
  lado: LadoDoScan,
  arquivo: Blob,
): Promise<ImagemApi> {
  const endereco = `https://api.cloudinary.com/v1_1/${encodeURIComponent(
    assinaturas.cloudName,
  )}/image/upload`;
  const resposta = await pedir(
    endereco,
    { method: "POST", body: formularioDoUpload(assinaturas, lado, arquivo) },
    false,
  );

  if (!resposta.ok) {
    throw new Error(`O Cloudinary recusou a foto (${resposta.status}).`);
  }

  const imagem = lerRecibo(await resposta.json(), assinaturas, lado);

  if (imagem === null) {
    throw new Error("A confirmação da foto veio inválida ou de outro scan.");
  }

  return imagem;
}

function detalhesDoErro(dados: unknown): string[] {
  if (typeof dados !== "object" || dados === null || !("details" in dados)) {
    return [];
  }

  const { details } = dados;

  return Array.isArray(details)
    ? details.filter((item): item is string => typeof item === "string")
    : [];
}

export async function enviarScanNaApi(corpo: CorpoDoScan): Promise<ScanEnviado> {
  const caminho = "/api/scan-sessions";
  const resposta = await pedir(`${URL_API_SCANS}${caminho}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corpo),
  });

  if (resposta.status === 403) {
    throw new ErroDeOrientacao(CONTA_SEM_PERMISSAO);
  }

  if (resposta.status === 400 || resposta.status === 422) {
    const detalhes = detalhesDoErro(await resposta.json());

    throw new ErroDeOrientacao(
      detalhes.length > 0
        ? `A API não aceitou o scan: ${detalhes.join("; ")}.`
        : "A API não aceitou o scan. Confira os dados e tente de novo.",
    );
  }

  verificarResposta(resposta, caminho);

  const enviado = lerScanEnviado(await resposta.json(), corpo.scanId);

  if (enviado === null) {
    throw new Error("A resposta do envio não corresponde a este scan.");
  }

  return enviado;
}
