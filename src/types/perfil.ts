import type { PersonalRiskLevel } from "./analise";
import type { StatusConta } from "./usuario";

export type TipoPele =
  | "normal"
  | "dry"
  | "oily"
  | "combination"
  | "sensitive"
  | "acneic"
  | "other";

export type Fototipo = "I" | "II" | "III" | "IV" | "V" | "VI";

export type TipoCabelo =
  | "1a"
  | "1b"
  | "1c"
  | "2a"
  | "2b"
  | "2c"
  | "3a"
  | "3b"
  | "3c"
  | "4a"
  | "4b"
  | "4c";

export type TipoCouroCabeludo =
  | "normal"
  | "dry"
  | "oily"
  | "sensitive"
  | "dandruff"
  | "other";

export type NivelSensibilidade = "low" | "medium" | "high" | "very_high";

export type FaixaEtaria =
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

export interface AlergiaCatalogo {
  id: string;
  name: string;
}

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

export interface AlergiaParaSalvar {
  allergyId: string;
  severity: PersonalRiskLevel | null;
}

export interface PerfilParaSalvar {
  gender: Genero | null;
  ageRange: FaixaEtaria | null;
  hairType: TipoCabelo | null;
  skinType: TipoPele | null;
  skinPhototype: Fototipo | null;
  skinSensitivity: NivelSensibilidade | null;
  scalpType: TipoCouroCabeludo | null;
  isPregnant: boolean | null;
  isBreastfeeding: boolean | null;
  acneProne: boolean | null;
  hasRosacea: boolean | null;
  hasEczema: boolean | null;
  hasHyperpigmentation: boolean | null;
  hasMelasma: boolean | null;
  preferences: PreferenciasPerfil;
  allergies: AlergiaParaSalvar[];
}

export interface PerfilCarregado {
  perfil: PerfilParaSalvar;
  accountStatus: StatusConta | null;
  avatarUrl: string | null;
}
