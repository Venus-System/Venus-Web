import { USAR_MOCK } from "../config/ambiente";
import {
  apagarAvatarNaApi,
  buscarAvatarNaApi,
  enviarAvatarNaApi,
} from "./api/avatar";
import { garantirIdDoUsuarioNaApi } from "./autenticacao";
import { ErroDeOrientacao, ErroServicoIndisponivel } from "./erros";
import { simularLatencia } from "./mocks/atraso";
import { guardarFotoFalsa, lerFotoFalsa, limparFotoFalsa } from "./mocks/avatar";
import { recortarEmQuadrado } from "../utils/imagem";

export const TIPOS_DE_IMAGEM = ["image/png", "image/jpeg", "image/webp"];
export const TAMANHO_MAXIMO_EM_MB = 20;

const TAMANHO_MAXIMO = TAMANHO_MAXIMO_EM_MB * 1024 * 1024;
const LADO_DO_AVATAR = 1024;

export function validarFoto(arquivo: File): string | null {
  if (!TIPOS_DE_IMAGEM.includes(arquivo.type)) {
    return "Envie uma imagem PNG, JPEG ou WebP.";
  }

  if (arquivo.size > TAMANHO_MAXIMO) {
    return `A imagem precisa ter no máximo ${TAMANHO_MAXIMO_EM_MB} MB.`;
  }

  return null;
}

async function prepararFoto(arquivo: File): Promise<File> {
  try {
    return await recortarEmQuadrado(arquivo, LADO_DO_AVATAR);
  } catch {
    throw new ErroDeOrientacao(
      "Não conseguimos abrir essa imagem. Tente outra foto.",
    );
  }
}

function comoTexto(arquivo: File): Promise<string> {
  return new Promise((resolver, rejeitar) => {
    const leitor = new FileReader();

    leitor.onload = () => resolver(String(leitor.result));
    leitor.onerror = () => rejeitar(new Error("Não foi possível ler o arquivo."));
    leitor.readAsDataURL(arquivo);
  });
}

async function idNumerico(): Promise<number> {
  const id = await garantirIdDoUsuarioNaApi();

  if (id === null) {
    throw new ErroDeOrientacao(
      "Não conseguimos ligar esta conta ao cadastro da API neste navegador. Entre de novo e tente outra vez.",
    );
  }

  return id;
}

export async function enviarFotoDePerfil(arquivo: File): Promise<string | null> {
  try {
    const foto = await prepararFoto(arquivo);

    if (USAR_MOCK) {
      const conteudo = await comoTexto(foto);

      await simularLatencia();
      guardarFotoFalsa(conteudo);

      return conteudo;
    }

    return await enviarAvatarNaApi(await idNumerico(), foto);
  } catch (erro) {
    if (
      erro instanceof ErroDeOrientacao ||
      erro instanceof ErroServicoIndisponivel
    ) {
      throw erro;
    }

    throw new Error("Não foi possível salvar a sua foto de perfil.");
  }
}

export async function apagarFotoDePerfil(): Promise<void> {
  try {
    if (USAR_MOCK) {
      await simularLatencia();
      limparFotoFalsa();

      return;
    }

    await apagarAvatarNaApi(await idNumerico());
  } catch (erro) {
    if (
      erro instanceof ErroDeOrientacao ||
      erro instanceof ErroServicoIndisponivel
    ) {
      throw erro;
    }

    throw new Error("Não foi possível remover a sua foto de perfil.");
  }
}

export async function buscarFotoDePerfil(
  sinal?: AbortSignal,
): Promise<string | null> {
  try {
    if (USAR_MOCK) {
      return lerFotoFalsa();
    }

    const id = await garantirIdDoUsuarioNaApi().catch(() => null);

    return id === null ? null : await buscarAvatarNaApi(id, sinal);
  } catch (erro) {
    if (erro instanceof DOMException && erro.name === "AbortError") {
      throw erro;
    }

    throw new Error("Não foi possível carregar a sua foto de perfil.");
  }
}
