export type SituacaoEnvio = "in_review" | "approved" | "published" | "rejected";

export interface Envio {
  id: string;
  name: string | null;
  brandName: string | null;
  photoUrl: string | null;
  submittedAt: string;
  status: SituacaoEnvio;
  decidedAt: string | null;
  rejectionReason: string | null;
  productSlug: string | null;
}

export interface Envios {
  listAvailable: boolean;
  submissions: Envio[];
}
