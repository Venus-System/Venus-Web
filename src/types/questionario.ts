import type { PersonalRiskLevel } from "./analise";
import type {
  FaixaEtaria,
  Fototipo,
  Genero,
  NivelSensibilidade,
  PreferenciasPerfil,
  TipoCouroCabeludo,
  TipoPele,
} from "./perfil";

export interface AlergiaSelecionada {
  id: string;
  severity: PersonalRiskLevel | "";
}

export type CurvaturaCabelo =
  | "1"
  | "2a"
  | "2b"
  | "2c"
  | "3a"
  | "3b"
  | "3c"
  | "4a"
  | "4b"
  | "4c";

export type SensibilidadeQuestionario = Exclude<
  NivelSensibilidade,
  "very_high"
>;

export interface RespostasQuestionario {
  gender: Genero | "";
  hairCurvature: CurvaturaCabelo | "";
  skinType: TipoPele | "";
  ageRange: FaixaEtaria | "";
  skinPhototype: Fototipo | "";
  skinSensitivity: SensibilidadeQuestionario | "";
  scalpType: TipoCouroCabeludo | "";
  allergyIds: string[];
  preferences: Array<keyof PreferenciasPerfil> | null;
  healthDataConsent: boolean;
  allergies: AlergiaSelecionada[] | null;
}
