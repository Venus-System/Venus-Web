export interface ConexaoDaAgenda {
  connected: boolean;
}

export type EstadoDaConexao =
  | { status: "carregando" }
  | { status: "erro"; mensagem: string }
  | { status: "pronta"; conectada: boolean };

export type EstadoDaDesconexao =
  | { status: "ociosa" }
  | { status: "desconectando" }
  | { status: "erro"; mensagem: string };

export interface PedidoDeConexao {
  state: string;
  codeVerifier: string;
  codeChallenge: string;
  returnTo: string;
}
