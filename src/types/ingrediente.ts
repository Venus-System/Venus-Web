import type {
  Auditavel,
  ComOrigem,
  IntensidadeEfeito,
  NivelEvidencia,
  StatusRevisao
} from './comum';
import type { TagPerfil } from './usuario';

export interface CategoriaIngrediente extends Auditavel {
  categoriaId: number;
  nome: string;
  descricao: string;
}

export interface Ingrediente extends Auditavel {
  ingredienteId: number;
  categoriaId: number;
  nomeInci: string;
  nomeComum: string;
  resumoFuncao: string;
  descricao: string;
  biodegradabilidade: number;
  riscoIrritacao: number;
  comedogenicidade: number;
  riscoAmbiental: number;
  resumoSeguranca: string;
  categoria?: CategoriaIngrediente;
}

export interface ApelidoIngrediente extends Auditavel {
  apelidoId: number;
  ingredienteId: number;
  apelido: string;
  idioma: string;
}

export interface PropriedadeIngrediente extends Auditavel, ComOrigem {
  propriedadeId: number;
  ingredienteId: number;
  nome: string;
  valor: string;
  unidade: string;
}

export type CategoriaEfeito = 'benefit' | 'risk' | 'restriction';

export interface EfeitoIngrediente extends Auditavel, ComOrigem {
  efeitoId: number;
  ingredienteId: number;
  tagPerfilId: number;
  categoria: CategoriaEfeito;
  nome: string;
  descricao: string;
  intensidade: IntensidadeEfeito;
  nivelEvidencia: NivelEvidencia;
  statusRevisao: StatusRevisao;
  ingrediente?: Ingrediente;
  tagPerfil?: TagPerfil;
}

export interface Regulacao extends Auditavel {
  regulacaoId: number;
  orgao: string;
  referencia: string;
  descricao: string;
  pais: string;
}

export interface RegulacaoIngrediente extends Auditavel, ComOrigem {
  ingredienteRegulacaoId: number;
  ingredienteId: number;
  regulacaoId: number;
  tipoRestricao: string;
  concentracaoMaxima: number | null;
  regulacao?: Regulacao;
}

export interface IngredienteDaFormula extends Auditavel {
  produtoIngredienteId: number;
  versaoId: number;
  ingredienteId: number;
  posicao: number;
  ingrediente?: Ingrediente;
}

export type NivelSemaforo = 'seguro' | 'atencao' | 'evitar' | 'sem_dados';

export interface IngredienteExibicao {
  ingredienteId: number;
  nomeInci: string;
  nomeComum: string;
  posicao: number;
  nivel: NivelSemaforo;
  explicacao: string;
}
