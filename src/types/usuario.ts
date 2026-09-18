export interface Usuario {
  id: string;
  name: string;
  email: string;
}

export type SituacaoAtual =
  | "pregnant"
  | "breastfeeding"
  | "pregnant_breastfeeding"
  | "none"
  | "prefer_not_say";

export type CondicaoPele =
  | "acneProne"
  | "hasRosacea"
  | "hasEczema"
  | "hasHyperpigmentation"
  | "hasMelasma"
  | "none";
