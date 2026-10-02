export type Estrelas = 1 | 2 | 3 | 4 | 5;

export type VotoDeAvaliacao = "useful" | "not_useful";

export type MotivoDenuncia =
  | "offensive"
  | "spam"
  | "false_information"
  | "sexual_content"
  | "other";

export interface Avaliacao {
  id: string;
  authorName: string | null;
  isMine: boolean;
  rating: number;
  title: string;
  comment: string;
  verifiedUse: boolean;
  usefulCount: number;
  createdAt: string;
}

export interface ResumoDasAvaliacoes {
  average: number | null;
  count: number;
  truncated: boolean;
  distribution: Record<Estrelas, number>;
}

export interface AvaliacoesDoProduto {
  reviews: Avaliacao[];
  summary: ResumoDasAvaliacoes;
}

export interface NovaAvaliacao {
  rating: Estrelas;
  title: string;
  comment: string;
  verifiedUse: boolean;
}

export interface Denuncia {
  reason: MotivoDenuncia;
  comment: string;
}
