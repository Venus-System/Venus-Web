import type { Auditavel, ComOrigem } from './comum';

export interface Marca extends Auditavel {
  marcaId: number;
  nome: string;
  paisOrigem: string;
  site: string;
  ativa: boolean;
}

export interface CategoriaProduto extends Auditavel {
  categoriaId: number;
  nome: string;
  slug: string;
  descricao: string;
}

export interface Produto extends Auditavel {
  produtoId: number;
  marcaId: number;
  categoriaId: number;
  nome: string;
  descricao: string;
  slug: string;
  ativo: boolean;
  marca?: Marca;
  categoria?: CategoriaProduto;
}

export type StatusVersao = 'pending' | 'approved' | 'rejected' | 'archived';

export type DetectadoPor = 'ocr' | 'user_submission' | 'admin' | 'import';

export interface VersaoProduto extends Auditavel {
  versaoId: number;
  produtoId: number;
  nomeVersao: string;
  nomeExibicao: string;
  status: StatusVersao;
  atual: boolean;
  assinaturaFormula: string;
  detectadoPor: DetectadoPor;
  validaDe: string;
  validaAte: string | null;
}

export type TipoImagem = 'official' | 'label' | 'user_upload';

export interface ImagemProduto extends Auditavel, ComOrigem {
  imagemId: number;
  versaoId: number;
  url: string;
  tipo: TipoImagem;
  principal: boolean;
  textoAlternativo: string;
}

export interface RotuloProduto extends Auditavel, ComOrigem {
  rotuloId: number;
  versaoId: number;
  textoBruto: string;
  textoNormalizado: string;
}

export interface Embalagem extends Auditavel, ComOrigem {
  embalagemId: number;
  versaoId: number;
  material: string;
  formato: string;
  reciclavel: boolean;
  refilavel: boolean;
  biodegradavel: boolean;
}

export interface Selo extends Auditavel {
  seloId: number;
  nome: string;
  descricao: string;
}

export interface SeloDoProduto extends Auditavel, ComOrigem {
  produtoSeloId: number;
  versaoId: number;
  seloId: number;
  verificado: boolean;
  selo?: Selo;
}

export interface ProdutoDetalhado {
  produto: Produto;
  versaoAtual: VersaoProduto;
  imagens: ImagemProduto[];
  embalagem: Embalagem | null;
  selos: SeloDoProduto[];
}

export interface ProdutoResumo {
  produtoId: number;
  slug: string;
  nome: string;
  marca: string;
  categoria: string;
  imagemUrl: string | null;
  notaGeral: number;
}
