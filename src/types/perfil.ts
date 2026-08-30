import type { PersonalRiskLevel } from "./analise";

export type TipoPele =
  | "normal"
  | "dry"
  | "oily"
  | "combination"
  | "sensitive"
  | "acneic"
  | "other";

export type Fototipo = "I" | "II" | "III" | "IV" | "V" | "VI";

export type TipoCabelo = "straight" | "wavy" | "curly" | "coily" | "other";

export type TipoCouroCabeludo =
  | "normal"
  | "dry"
  | "oily"
  | "sensitive"
  | "dandruff"
  | "other";

export type NivelSensibilidade = "low" | "medium" | "high" | "very_high";

export type FaixaEtaria =
  | "under_13"
  | "age_13_17"
  | "age_18_24"
  | "age_25_34"
  | "age_35_44"
  | "age_45_54"
  | "age_55_plus";

export type Genero =
  | "female"
  | "male"
  | "non_binary"
  | "other"
  | "prefer_not_say";

export type TipoAlergia = "ingredient" | "material" | "condition" | "other";

export interface Alergia {
  name: string;
  type: TipoAlergia;
  severity: PersonalRiskLevel;
}

export interface PreferenciasPerfil {
  preferCrueltyFree: boolean;
  preferVegan: boolean;
  preferSustainable: boolean;
  preferFragranceFree: boolean;
  preferParabenFree: boolean;
  preferSulfateFree: boolean;
  preferSiliconeFree: boolean;
}

export interface Perfil {
  skinType: TipoPele;
  skinPhototype: Fototipo;
  hairType: TipoCabelo;
  scalpType: TipoCouroCabeludo;
  skinSensitivity: NivelSensibilidade;
  acneProne: boolean;
  ageRange: FaixaEtaria;
  gender: Genero;
  isPregnant: boolean;
  hasHyperpigmentation: boolean;
  hasMelasma: boolean;
  hasRosacea: boolean;
  hasEczema: boolean;
  preferences: PreferenciasPerfil;
  allergies: Alergia[];
}
