import pacote from "../../package.json";
import { USAR_MOCK } from "../config/ambiente";
import { autenticacaoFirebase } from "../config/firebase";
import type { RascunhoDoScan, ScanEnviado } from "../types/escanear";
import { juntarQualidades } from "../utils/qualidadeDaFoto";
import { montarCorpo, validarCorpo } from "./api/corpoDoScan";
import type { DispositivoApi } from "./api/corpoDoScan";
import {
  buscarAssinaturasNaApi,
  enviarScanNaApi,
  subirFotoNoCloudinary,
} from "./api/escanear";
import { garantirIdDoUsuarioNaApi } from "./autenticacao";
import { ErroDeOrientacao, ErroServicoIndisponivel } from "./erros";
import { simularLatencia } from "./mocks/atraso";

const CHAVE_DA_INSTALACAO = "venus.idDaInstalacao";

export function novoScanId(): string {
  return crypto.randomUUID();
}

function idDaInstalacao(): string {
  try {
    const guardado = localStorage.getItem(CHAVE_DA_INSTALACAO);

    if (guardado !== null && guardado !== "") {
      return guardado;
    }

    const novo = crypto.randomUUID();
    localStorage.setItem(CHAVE_DA_INSTALACAO, novo);

    return novo;
  } catch {
    return crypto.randomUUID();
  }
}

function dispositivo(): DispositivoApi {
  return {
    deviceId: idDaInstalacao(),
    platform: "web",
    appVersion: pacote.version,
    model: navigator.userAgent,
  };
}

async function enviarNaApi(rascunho: RascunhoDoScan): Promise<ScanEnviado> {
  const conta = autenticacaoFirebase?.currentUser ?? null;

  if (conta === null) {
    throw new ErroDeOrientacao("Entre na sua conta para enviar um produto.");
  }

  if ((await garantirIdDoUsuarioNaApi()) === null) {
    throw new ErroDeOrientacao(
      "Não conseguimos ligar esta conta ao cadastro da API neste navegador. Entre de novo e tente outra vez.",
    );
  }

  const assinaturas = await buscarAssinaturasNaApi(rascunho.scanId);
  const front = await subirFotoNoCloudinary(
    assinaturas,
    "front",
    rascunho.frente.arquivo,
  );
  const back = await subirFotoNoCloudinary(
    assinaturas,
    "back",
    rascunho.verso.arquivo,
  );
  const corpo = montarCorpo(
    rascunho,
    conta.uid,
    dispositivo(),
    { front, back },
    juntarQualidades(rascunho.frente.qualidade, rascunho.verso.qualidade),
    new Date().toISOString(),
  );
  const problema = validarCorpo(corpo);

  if (problema !== null) {
    throw new ErroDeOrientacao(problema);
  }

  return enviarScanNaApi(corpo);
}

export async function enviarScan(rascunho: RascunhoDoScan): Promise<ScanEnviado> {
  try {
    if (USAR_MOCK) {
      await simularLatencia();

      return {
        id: `mock-${rascunho.scanId}`,
        scanId: rascunho.scanId,
        status: "PENDING_REVIEW",
      };
    }

    return await enviarNaApi(rascunho);
  } catch (erro) {
    if (erro instanceof ErroDeOrientacao || erro instanceof ErroServicoIndisponivel) {
      throw erro;
    }

    throw new Error(
      "Não foi possível enviar o produto. Tente de novo: o mesmo envio não é duplicado.",
    );
  }
}
