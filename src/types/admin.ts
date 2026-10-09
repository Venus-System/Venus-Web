export type PapelAdmin = "admin" | "moderator" | "analyst";

export interface Administrador {
  id: number;
  name: string;
  email: string;
  role: PapelAdmin;
}

export interface SessaoAdmin {
  token: string;
  expiresAt: string;
  admin: Administrador;
}

export type OrigemCandidato = "ocr" | "user_submission" | "import";

export type LadoEmbalagem = "front" | "back";

export interface FonteDoLado {
  photoUrl: string | null;
  rawText: string;
}

export interface TrechoNoTexto {
  side: LadoEmbalagem;
  start: number;
  end: number;
}

export type EstadoIngrediente = "known" | "alias" | "ambiguous" | "new";

export interface IngredienteCandidato {
  ingredientId: number;
  inciName: string;
}

export interface IngredienteInterpretado {
  id: string;
  position: number;
  rawName: string;
  name: string;
  status: EstadoIngrediente;
  ingredientId: number | null;
  candidates: IngredienteCandidato[];
  match: TrechoNoTexto | null;
}

export interface CandidatoResumo {
  id: string;
  name: string;
  brand: string;
  category: string;
  submittedBy: string;
  submittedAt: string;
  origin: OrigemCandidato;
  ingredientCount: number;
  newIngredientCount: number;
  ambiguousIngredientCount: number;
}

export interface Candidato extends CandidatoResumo {
  sources: Record<LadoEmbalagem, FonteDoLado>;
  ingredients: IngredienteInterpretado[];
}

export interface FiltroFila {
  origin: OrigemCandidato | null;
}

export type MotivoRecusa =
  | "ocr_misread"
  | "illegible_photo"
  | "duplicate_product"
  | "not_cosmetic"
  | "other";

export interface RecusaCandidato {
  reason: MotivoRecusa;
  comment: string;
}

export interface OpcaoDoCatalogo {
  id: number;
  name: string;
}

export interface CatalogoDaRevisao {
  brands: OpcaoDoCatalogo[];
  categories: OpcaoDoCatalogo[];
}

export interface ProdutoParaAprovar {
  name: string;
  brandId: number;
  productCategoryId: number;
}

export type DecisaoIngrediente =
  | { position: number; action: "link"; ingredientId: number }
  | { position: number; action: "create"; inciName: string }
  | { position: number; action: "discard" };

export interface AprovacaoCandidato {
  product: ProdutoParaAprovar;
  ingredients: DecisaoIngrediente[];
}

export type ResultadoAprovacao =
  | { status: "publicado"; productVersionId: number | null }
  | { status: "sincronizacaoFalhou" };
