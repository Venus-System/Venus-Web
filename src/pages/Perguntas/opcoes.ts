import type { RadioOption } from "../../components/GrupoRadio";
import type { SelectOption } from "../../components/ListaSuspensa";
import type { SearchOption } from "../../components/BuscaComChips";
import type {
  FaixaEtaria,
  Fototipo,
  Genero,
  Preferencia,
  TipoCouroCabeludo,
  TipoPele,
} from "../../types/perfil";
import type {
  CurvaturaCabelo,
  SensibilidadeQuestionario,
} from "../../types/questionario";
import { CheckboxOption } from "../../components/GrupoCaixas";
import { SituacaoAtual, CondicaoPele } from "../../types/usuario";

export const OPCOES_GENERO: RadioOption<Genero>[] = [
  { value: "female", label: "Feminino" },
  { value: "male", label: "Masculino" },
  { value: "non_binary", label: "Não binário" },
  { value: "other", label: "Outro" },
  { value: "prefer_not_say", label: "Prefiro não dizer" },
];

export const OPCOES_CABELO: RadioOption<CurvaturaCabelo>[] = [
  { value: "1a", label: "1a" },
  { value: "1b", label: "1b" },
  { value: "1c", label: "1c" },
  { value: "2a", label: "2a" },
  { value: "2b", label: "2b" },
  { value: "2c", label: "2c" },
  { value: "3a", label: "3a" },
  { value: "3b", label: "3b" },
  { value: "3c", label: "3c" },
  { value: "4a", label: "4a" },
  { value: "4b", label: "4b" },
  { value: "4c", label: "4c" },
];

export const OPCOES_PELE: RadioOption<TipoPele>[] = [
  { value: "oily", label: "Oleosa" },
  { value: "combination", label: "Mista" },
  { value: "normal", label: "Normal" },
  { value: "sensitive", label: "Sensível" },
  { value: "dry", label: "Seca" },
];

export const OPCOES_IDADE: SelectOption<FaixaEtaria>[] = [
  { value: "age_13_17", label: "13 a 17 anos" },
  { value: "age_18_24", label: "18 a 24 anos" },
  { value: "age_25_34", label: "25 a 34 anos" },
  { value: "age_35_44", label: "35 a 44 anos" },
  { value: "age_45_54", label: "45 a 54 anos" },
  { value: "age_55_plus", label: "55 anos ou mais" },
];

export const OPCOES_FOTOTIPO: RadioOption<Fototipo>[] = [
  { value: "I", label: "I" },
  { value: "II", label: "II" },
  { value: "III", label: "III" },
  { value: "IV", label: "IV" },
  { value: "V", label: "V" },
  { value: "VI", label: "VI" },
];

export const OPCOES_SENSIBILIDADE: RadioOption<SensibilidadeQuestionario>[] = [
  { value: "low", label: "Baixa" },
  { value: "medium", label: "Média" },
  { value: "high", label: "Alta" },
];

export const OPCOES_COURO: RadioOption<TipoCouroCabeludo>[] = [
  { value: "normal", label: "Normal" },
  { value: "dry", label: "Seco" },
  { value: "oily", label: "Oleoso" },
  { value: "dandruff", label: "Com caspa" },
  { value: "sensitive", label: "Sensível" },
  { value: "other", label: "Não sei ou outro" },
];

export const OPCOES_PREFERENCIAS: SearchOption<Preferencia>[] = [
  { id: "vegan", label: "Vegano" },
  { id: "crueltyFree", label: "Cruelty free" },
  { id: "parabenFree", label: "Sem parabenos" },
  { id: "sulfateFree", label: "Sem sulfatos" },
  { id: "siliconeFree", label: "Sem silicones" },
  { id: "alcoholFree", label: "Sem álcool" },
  { id: "oilFree", label: "Sem óleo" },
  { id: "natural", label: "Natural" },
  { id: "organic", label: "Orgânico" },
  { id: "hypoallergenic", label: "Hipoalergênico" },
  { id: "nonComedogenic", label: "Não comedogênico" },
  { id: "dermatologicallyTested", label: "Testado dermatologicamente" },
  { id: "recyclablePackaging", label: "Embalagem reciclável" },
];

export const OPCOES_SITUACAO: RadioOption<SituacaoAtual>[] = [
  { value: "pregnant", label: "Gestante" },
  { value: "breastfeeding", label: "Amamentando" },
  { value: "pregnant_breastfeeding", label: "Gestante + Amamentando" },
  { value: "none", label: "Nenhuma" },
  { value: "prefer_not_say", label: "Prefiro não dizer" },
];

export const OPCOES_CONDICOES: CheckboxOption<CondicaoPele>[] = [
  { value: "acneProne", label: "Tendência à acne" },
  { value: "hasRosacea", label: "Rosácea" },
  { value: "hasEczema", label: "Eczema" },
  { value: "hasHyperpigmentation", label: "Hiperpigmentação" },
  { value: "hasMelasma", label: "Melasma" },
  { value: "none", label: "Nenhuma" },
];
