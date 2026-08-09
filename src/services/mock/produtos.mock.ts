import type {
  AnaliseExibicao,
  IngredienteExibicao,
  ProdutoDetalhado,
  ProdutoResumo
} from '../../types';

export const PRODUTOS_RESUMO: ProdutoResumo[] = [
  {
    produtoId: 1,
    slug: 'serum-vitamina-c-pro',
    nome: 'Sérum Vitamina C Pro',
    marca: 'Lumina Skin',
    categoria: 'Tratamento',
    imagemUrl: null,
    notaGeral: 87
  },
  {
    produtoId: 2,
    slug: 'hidratante-calm-plus',
    nome: 'Hidratante Calm+',
    marca: 'Vertie',
    categoria: 'Hidratação',
    imagemUrl: null,
    notaGeral: 91
  },
  {
    produtoId: 3,
    slug: 'protetor-solar-fps-70',
    nome: 'Protetor Solar FPS 70',
    marca: 'Solari',
    categoria: 'Proteção solar',
    imagemUrl: null,
    notaGeral: 78
  },
  {
    produtoId: 4,
    slug: 'shampoo-detox-menta',
    nome: 'Shampoo Detox Menta',
    marca: 'Kapil',
    categoria: 'Cabelo',
    imagemUrl: null,
    notaGeral: 54
  },
  {
    produtoId: 5,
    slug: 'creme-noturno-renew',
    nome: 'Creme Noturno Renew',
    marca: 'Vertie',
    categoria: 'Hidratação',
    imagemUrl: null,
    notaGeral: 20
  },
  {
    produtoId: 6,
    slug: 'oleo-de-rosa-mosqueta',
    nome: 'Óleo de Rosa Mosqueta',
    marca: 'Terra Viva',
    categoria: 'Tratamento',
    imagemUrl: null,
    notaGeral: 95
  }
];

const DATA_EXEMPLO = '2026-07-01T12:00:00Z';

export const PRODUTOS_DETALHE: Record<string, ProdutoDetalhado> = {
  'serum-vitamina-c-pro': {
    produto: {
      produtoId: 1,
      marcaId: 1,
      categoriaId: 1,
      nome: 'Sérum Vitamina C Pro',
      descricao: 'Sérum antioxidante de uso diário.',
      slug: 'serum-vitamina-c-pro',
      ativo: true,
      createdAt: DATA_EXEMPLO,
      updatedAt: DATA_EXEMPLO,
      marca: {
        marcaId: 1,
        nome: 'Lumina Skin',
        paisOrigem: 'Brasil',
        site: 'https://exemplo.com.br',
        ativa: true,
        createdAt: DATA_EXEMPLO,
        updatedAt: DATA_EXEMPLO
      },
      categoria: {
        categoriaId: 1,
        nome: 'Tratamento',
        slug: 'tratamento',
        descricao: 'Produtos de tratamento facial.',
        createdAt: DATA_EXEMPLO,
        updatedAt: DATA_EXEMPLO
      }
    },
    versaoAtual: {
      versaoId: 1,
      produtoId: 1,
      nomeVersao: 'v1',
      nomeExibicao: 'Fórmula atual',
      status: 'approved',
      atual: true,
      assinaturaFormula: 'abc123',
      detectadoPor: 'admin',
      validaDe: DATA_EXEMPLO,
      validaAte: null,
      createdAt: DATA_EXEMPLO,
      updatedAt: DATA_EXEMPLO
    },
    imagens: [],
    embalagem: null,
    selos: []
  }
};

const INGREDIENTES_SERUM: IngredienteExibicao[] = [
  {
    ingredienteId: 1,
    nomeInci: 'Ascorbic Acid',
    nomeComum: 'Ácido L-Ascórbico',
    posicao: 3,
    nivel: 'seguro',
    explicacao: 'Vitamina C pura. Antioxidante com evidência forte para uniformizar o tom.'
  },
  {
    ingredienteId: 2,
    nomeInci: 'Sodium Hyaluronate',
    nomeComum: 'Ácido Hialurônico',
    posicao: 5,
    nivel: 'seguro',
    explicacao: 'Umectante que segura água na pele. Seguro em qualquer concentração.'
  },
  {
    ingredienteId: 3,
    nomeInci: 'Parfum',
    nomeComum: 'Fragrância',
    posicao: 9,
    nivel: 'atencao',
    explicacao: 'Principal causa de irritação em peles sensíveis ou reativas.'
  },
  {
    ingredienteId: 4,
    nomeInci: 'Tocopherol',
    nomeComum: 'Vitamina E',
    posicao: 11,
    nivel: 'seguro',
    explicacao: 'Antioxidante que ajuda a estabilizar a fórmula.'
  }
];

export const ANALISE_PUBLICA: AnaliseExibicao = {
  notasProduto: {
    produtoScoreId: 1,
    versaoId: 1,
    modeloId: 1,
    notaGeral: 87,
    notaSaude: 87,
    notaAmbiental: 72,
    notaEtica: 94,
    notaTransparencia: 80,
    createdAt: DATA_EXEMPLO,
    updatedAt: DATA_EXEMPLO
  },
  ingredientes: INGREDIENTES_SERUM,
  avisos: [
    {
      titulo: 'Contém fragrância',
      descricao: 'Uma das causas mais comuns de irritação em peles sensíveis.',
      nivel: 'atencao'
    },
    {
      titulo: 'Sem ingredientes contraindicados na gestação',
      descricao: 'A fórmula não traz retinoides nem outros ativos restritos na gravidez.',
      nivel: 'seguro'
    },
    {
      titulo: 'Fórmula vegana',
      descricao: 'Sem ingredientes de origem animal declarados no rótulo.',
      nivel: 'seguro'
    }
  ],
  personalizada: null
};
