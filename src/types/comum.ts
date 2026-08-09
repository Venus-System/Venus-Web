export type OrigemDado =
  | 'ocr'
  | 'official_site'
  | 'admin'
  | 'import'
  | 'user';

export type NivelEvidencia = 'low' | 'medium' | 'high';

export type StatusRevisao = 'pending' | 'approved' | 'rejected';

export type IntensidadeEfeito = 'weak' | 'moderate' | 'strong';

export interface Auditavel {
  createdAt: string;
  updatedAt: string;
}

export interface ComOrigem {
  sourceType: OrigemDado;
  sourceReference: string | null;
}

export interface EstadoRequisicao<T> {
  dados: T | null;
  carregando: boolean;
  erro: string | null;
}

export function estadoInicial<T>(): EstadoRequisicao<T> {
  return { dados: null, carregando: false, erro: null };
}

export interface Paginado<T> {
  itens: T[];
  pagina: number;
  totalPaginas: number;
  totalItens: number;
}
