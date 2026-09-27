const QUALIDADE = 0.9;

const EXTENSAO_POR_TIPO: Partial<Record<string, string>> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function nomeSemExtensao(nome: string): string {
  const ponto = nome.lastIndexOf(".");

  return ponto <= 0 ? nome : nome.slice(0, ponto);
}

function paraBlob(tela: HTMLCanvasElement, tipo: string): Promise<Blob> {
  return new Promise((resolver, rejeitar) => {
    tela.toBlob(
      (blob) => {
        if (blob === null) {
          rejeitar(new Error("Não foi possível gerar a imagem recortada."));
          return;
        }

        resolver(blob);
      },
      tipo,
      QUALIDADE,
    );
  });
}

export async function recortarEmQuadrado(
  arquivo: File,
  ladoMaximo: number,
): Promise<File> {
  const imagem = await createImageBitmap(arquivo);

  try {
    const lado = Math.min(imagem.width, imagem.height);
    const destino = Math.min(lado, ladoMaximo);
    const origemX = (imagem.width - lado) / 2;
    const origemY = (imagem.height - lado) / 2;

    const tela = document.createElement("canvas");

    tela.width = destino;
    tela.height = destino;

    const contexto = tela.getContext("2d");

    if (contexto === null) {
      throw new Error("O navegador não conseguiu preparar a imagem.");
    }

    contexto.drawImage(
      imagem,
      origemX,
      origemY,
      lado,
      lado,
      0,
      0,
      destino,
      destino,
    );

    const blob = await paraBlob(tela, arquivo.type);
    const extensao = EXTENSAO_POR_TIPO[blob.type] ?? "png";

    return new File([blob], `${nomeSemExtensao(arquivo.name)}.${extensao}`, {
      type: blob.type,
    });
  } finally {
    imagem.close();
  }
}
