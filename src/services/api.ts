const URL_BASE: string = import.meta.env.VITE_API_URL;

export const USAR_MOCK: boolean = import.meta.env.VITE_USAR_MOCK === 'true';

export class ErroApi extends Error {
  readonly status: number;

  constructor(mensagem: string, status: number) {
    super(mensagem);
    this.name = 'ErroApi';
    this.status = status;
  }
}

function mensagemPorStatus(status: number): string {
  if (status === 404) return 'Não encontramos o que você procura.';
  if (status === 401 || status === 403) return 'Você precisa entrar na sua conta para ver isso.';
  if (status >= 500) return 'O servidor teve um problema. Tente de novo em alguns instantes.';
  return 'Não foi possível carregar os dados.';
}

export async function buscar<T>(caminho: string, sinal?: AbortSignal): Promise<T> {
  try {
    const resposta = await fetch(`${URL_BASE}${caminho}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: sinal
    });

    if (!resposta.ok) {
      throw new ErroApi(mensagemPorStatus(resposta.status), resposta.status);
    }

    return (await resposta.json()) as T;
  } catch (erro) {
    if (erro instanceof DOMException && erro.name === 'AbortError') {
      throw erro;
    }
    if (erro instanceof ErroApi) {
      throw erro;
    }
    throw new ErroApi('Não foi possível conectar ao servidor.', 0);
  }
}

export function simularEspera<T>(dados: T, milissegundos = 400): Promise<T> {
  return new Promise((resolver) => {
    setTimeout(() => resolver(dados), milissegundos);
  });
}
