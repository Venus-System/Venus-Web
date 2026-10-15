export type ExpressaoDaVeninha = "neutra" | "magoada";

export type HumorDaVeninha = "feliz" | "chorando" | "confusa" | "pensando";

export type AutorDaMensagem = "pessoa" | "veninha";

export interface MensagemDoChat {
  id: string;
  author: AutorDaMensagem;
  text: string;
  sentAt: string;
}

export interface RespostaDoChat {
  reply: string;
  conversationId: string;
  expression: ExpressaoDaVeninha;
}
