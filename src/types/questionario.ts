import type { PersonalRiskLevel } from "./analise";
import type {
  FaixaEtaria,
  Fototipo,
  Genero,
  NivelSensibilidade,
  Preferencia,
  TipoCouroCabeludo,
  TipoPele,
  TipoCabelo
} from "./perfil";
import { SituacaoAtual, CondicaoPele } from "./usuario";

export interface AlergiaSelecionada {
  id: string;
  severity: PersonalRiskLevel | "";
}

export type CurvaturaCabelo = TipoCabelo

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
  allergies: AlergiaSelecionada[];
  preferences: Preferencia[];
  healthDataConsent: boolean;
  currentSituation: SituacaoAtual | "";
  skinConditions: CondicaoPele[];
}
