export type StatusDaQualidade =
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "PENDING_REVIEW";

export interface QualidadeDaFoto {
  blurScore: number;
  brightness: number;
  backgroundOk: boolean;
  status: StatusDaQualidade;
}

export type MotivoDeBloqueio = "BLUR_TOO_HIGH" | "TOO_DARK" | "TOO_BRIGHT";

export interface TrechoDosIngredientes {
  encontrado: boolean;
  texto: string;
}

export interface IngredienteDaLista {
  position: number;
  rawName: string;
  looksLikePackaging: boolean;
}
