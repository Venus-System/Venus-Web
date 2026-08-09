import type { Auditavel, NivelEvidencia } from './comum';
import type { IngredienteExibicao } from './ingrediente';

export interface ModeloPontuacao extends Auditavel {
  modeloId: number;
  nome: string;
  versao: string;
  descricao: string;
  ativo: boolean;
}

export interface CategoriaScore extends Auditavel {
  categoriaScoreId: number;
  nome: string;
  peso: number;
  descricao: string;
}

export type TipoEfeitoRegra = 'boost' | 'penalize' | 'alert' | 'block';

export interface RegraCompatibilidade extends Auditavel {
  regraId: number;
  efeitoIngredienteId: number;
  modeloId: number;
  tipoEfeito: TipoEfeitoRegra;
  deltaScore: number;
  peso: number;
  prioridade: number;
  usaFatorConcentracao: boolean;
  habilitada: boolean;
  nivelEvidencia: NivelEvidencia;
}

export interface NotasProduto extends Auditavel {
  produtoScoreId: number;
  versaoId: number;
  modeloId: number;
  notaGeral: number;
  notaSaude: number;
  notaAmbiental: number;
  notaEtica: number;
  notaTransparencia: number;
}

export interface ComponenteScore extends Auditavel {
  componenteId: number;
  produtoScoreId: number;
  categoriaScoreId: number;
  nome: string;
  valor: number;
  peso: number;
  contribuicao: number;
  observacoes: string;
}

export interface ResultadoAnalise extends Auditavel {
  analiseId: number;
  sessaoScanId: number;
  usuarioId: number;
  versaoId: number;
  modeloId: number;
  notaGeral: number;
  notaSaude: number;
  notaAmbiental: number;
  notaEtica: number;
  notaDesempenho: number;
  notaTransparencia: number;
}

export interface AvaliacaoRegra extends Auditavel {
  avaliacaoId: number;
  analiseId: number;
  regraId: number;
  ingredienteId: number;
  tagPerfilId: number;
  aplicou: boolean;
  deltaScore: number;
  deltaFinal: number;
  explicacao: string;
}

export type NivelRisco = 'low' | 'medium' | 'high' | 'critical';

export type NivelRecomendacao = 'recommended' | 'caution' | 'avoid';

export interface NotaPersonalizada extends Auditavel {
  notaPersonalizadaId: number;
  usuarioId: number;
  versaoId: number;
  notaFinal: number;
  nivelRisco: NivelRisco;
  nivelRecomendacao: NivelRecomendacao;
  resumoCompatibilidade: string;
}

export interface Recomendacao extends Auditavel {
  recomendacaoId: number;
  usuarioId: number;
  versaoId: number;
  motivo: string;
  posicao: number;
}

export type StatusScan =
  | 'created'
  | 'ocr_processing'
  | 'normalization'
  | 'completed'
  | 'failed';

export interface SessaoScan extends Auditavel {
  sessaoId: number;
  usuarioId: number;
  status: StatusScan;
  textoBruto: string;
  mensagemErro: string | null;
}

export interface AvisoAnalise {
  titulo: string;
  descricao: string;
  nivel: 'seguro' | 'atencao' | 'evitar';
}

export interface AnaliseExibicao {
  notasProduto: NotasProduto;
  ingredientes: IngredienteExibicao[];
  avisos: AvisoAnalise[];
  personalizada: NotaPersonalizada | null;
}
