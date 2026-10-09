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

export type LadoDoScan = "front" | "back";

export interface FotoLida {
  arquivo: Blob;
  fullText: string;
  lines: string[];
  qualidade: QualidadeDaFoto;
}

export interface RascunhoDoScan {
  scanId: string;
  startedAt: string;
  frente: FotoLida;
  verso: FotoLida;
  productName: string;
  brand: string;
  ingredientsText: string;
  ingredientes: IngredienteDaLista[];
  usouExemplo: boolean;
}

export interface ScanEnviado {
  id: string;
  scanId: string;
  status: string;
}
