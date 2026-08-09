import type { Auditavel } from './comum';
import type { ProdutoResumo } from './produto';

export interface Avaliacao extends Auditavel {
  avaliacaoId: number;
  usuarioId: number;
  versaoId: number;
  nota: number;
  titulo: string;
  texto: string;
  publicada: boolean;
  autorNome?: string;
  autorPerfilResumo?: string;
  votosUteis?: number;
}

export type TipoVoto = 'useful' | 'not_useful';

export interface VotoAvaliacao extends Auditavel {
  votoId: number;
  avaliacaoId: number;
  usuarioId: number;
  tipo: TipoVoto;
}

export type StatusDenuncia = 'open' | 'in_review' | 'resolved' | 'rejected';

export interface Denuncia extends Auditavel {
  denunciaId: number;
  usuarioId: number;
  motivo: string;
  descricao: string;
  status: StatusDenuncia;
}

export interface Favorito extends Auditavel {
  favoritoId: number;
  usuarioId: number;
  versaoId: number;
  produto?: ProdutoResumo;
}

export type TipoLista = 'favorites' | 'wishlist' | 'custom';

export interface ListaUsuario extends Auditavel {
  listaId: number;
  usuarioId: number;
  nome: string;
  tipo: TipoLista;
  descricao: string;
}

export interface ItemLista extends Auditavel {
  itemId: number;
  listaId: number;
  versaoId: number;
  posicao: number;
  produto?: ProdutoResumo;
}

export type PeriodoRotina = 'morning' | 'evening' | 'weekly';

export interface Rotina extends Auditavel {
  rotinaId: number;
  usuarioId: number;
  nome: string;
  periodo: PeriodoRotina;
  descricao: string;
}

export interface ItemRotina extends Auditavel {
  itemRotinaId: number;
  rotinaId: number;
  versaoId: number;
  ordem: number;
  observacao: string;
  produto?: ProdutoResumo;
}

export interface ItemHistorico {
  analiseId: number;
  produto: ProdutoResumo;
  dataAnalise: string;
  origem: 'busca' | 'rotulo';
  favoritado: boolean;
}

export interface ResumoDashboard {
  analisesFeitas: number;
  notaMediaRotina: number;
  alertasEvitados: number;
  totalFavoritos: number;
  notaSaude: number;
  notaAmbiental: number;
  notaEtica: number;
  produtosAprovados: number;
  produtosComAtencao: number;
  produtosParaSubstituir: number;
}
