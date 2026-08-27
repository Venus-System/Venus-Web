import { NivelRiscoPessoal } from "./analise";

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
  nome: string;
  tipo: TipoAlergia;
  severidade: NivelRiscoPessoal;
}

export interface PreferenciasPerfil {
  crueltyFree: boolean;
  vegano: boolean;
  sustentavel: boolean;
  semFragrancia: boolean;
  semParabenos: boolean;
  semSulfatos: boolean;
  semSilicones: boolean;
}

export interface Perfil {
  tipoPele: TipoPele;
  fototipo: Fototipo;
  tipoCabelo: TipoCabelo;
  tipoCouroCabeludo: TipoCouroCabeludo;
  sensibilidadePele: NivelSensibilidade;
  tendenciaAcne: boolean;
  faixaEtaria: FaixaEtaria;
  genero: Genero;
  gestante: boolean;
  temHiperpigmentacao: boolean;
  temMelasma: boolean;
  temRosacea: boolean;
  temEczema: boolean;
  preferencias: PreferenciasPerfil;
  alergias: Alergia[];
}
