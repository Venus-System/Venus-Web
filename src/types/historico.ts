import type { AnaliseRecente } from "./painel";

export interface PaginaDoHistorico {
  items: AnaliseRecente[];
  hasMore: boolean;
}
