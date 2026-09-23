import { USAR_MOCK } from "../config/ambiente";
import { apagarAvatarNaApi, enviarAvatarNaApi } from "./api/avatar";
import { idDoUsuarioNaApi } from "./autenticacao";
import { ErroDeOrientacao, ErroServicoIndisponivel } from "./erros";
import { simularLatencia } from "./mocks/atraso";
import { guardarFotoFalsa, lerFotoFalsa, limparFotoFalsa } from "./mocks/avatar";

export const TIPOS_DE_IMAGEM = ["image/png", "image/jpeg", "image/webp"];
export const TAMANHO_MAXIMO = 5 * 1024 * 1024;

export function validarFoto(arquivo: File): string | null {
  if (!TIPOS_DE_IMAGEM.includes(arquivo.type)) {
    return "Envie uma imagem PNG, JPEG ou WebP.";
  }

  if (arquivo.size > TAMANHO_MAXIMO) {
    return "A imagem precisa ter no máximo 5 MB.";
  }

  return null;
}

function comoTexto(arquivo: File): Promise<string> {
  return new Promise((resolver, rejeitar) => {
    const leitor = new FileReader();

    leitor.onload = () => resolver(String(leitor.result));
    leitor.onerror = () => rejeitar(new Error("Não foi possível ler o arquivo."));
    leitor.readAsDataURL(arquivo);
  });
}

function idNumerico(): number {
  const id = idDoUsuarioNaApi();

  if (id === null) {
    throw new ErroDeOrientacao(
      "Não conseguimos ligar esta conta ao cadastro da API neste navegador. Entre de novo e tente outra vez.",
    );
  }

  return id;
}

export async function enviarFotoDePerfil(arquivo: File): Promise<string | null> {
  try {
    if (USAR_MOCK) {
      const conteudo = await comoTexto(arquivo);

      await simularLatencia();
      guardarFotoFalsa(conteudo);

      return conteudo;
    }

    return await enviarAvatarNaApi(idNumerico(), arquivo);
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

    await apagarAvatarNaApi(idNumerico());
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

export function fotoGuardadaNoMock(): string | null {
  return USAR_MOCK ? lerFotoFalsa() : null;
}
