import type {
  AprovacaoCandidato,
  Candidato,
  CatalogoDaRevisao,
  DecisaoIngrediente,
  EstadoIngrediente,
  IngredienteInterpretado,
  OpcaoDoCatalogo,
  ResultadoAprovacao,
} from "../../types/admin";
import { localizarNoTexto } from "../../utils/localizarNoTexto";
import { ErroCandidatoNaoEncontrado, ErroRevisaoInvalida } from "../erros";

const UM_DIA = 24 * 60 * 60 * 1000;

interface LeituraDoMock {
  rawName: string;
  status: EstadoIngrediente;
  matchedName: string | null;
  candidates: string[];
}

interface ProdutoDoMock {
  id: string;
  nome: string;
  marca: string;
  categoria: string;
  quemEnviou: string;
  diasAtras: number;
  frente: string[];
  verso: string[];
  leituras: LeituraDoMock[];
}

const idsDoCatalogo = new Map<string, number>();

function idNoCatalogo(nome: string): number {
  const existente = idsDoCatalogo.get(nome);

  if (existente !== undefined) {
    return existente;
  }

  const novo = 100 + idsDoCatalogo.size;

  idsDoCatalogo.set(nome, novo);

  return novo;
}

function conhecido(rawName: string, matchedName: string): LeituraDoMock {
  return { rawName, status: "known", matchedName, candidates: [] };
}

function apelido(rawName: string, matchedName: string): LeituraDoMock {
  return { rawName, status: "alias", matchedName, candidates: [] };
}

function ambiguo(rawName: string, candidatos: string[]): LeituraDoMock {
  return { rawName, status: "ambiguous", matchedName: null, candidates: candidatos };
}

function novo(rawName: string): LeituraDoMock {
  return { rawName, status: "new", matchedName: null, candidates: [] };
}

function montar(produto: ProdutoDoMock): Candidato {
  const textos = {
    front: produto.frente.join("\n"),
    back: produto.verso.join("\n"),
  };

  const ingredients: IngredienteInterpretado[] = produto.leituras.map(
    (leitura, indice) => ({
      id: `${produto.id}-${indice + 1}`,
      position: indice + 1,
      rawName: leitura.rawName,
      name: leitura.matchedName ?? leitura.rawName,
      status: leitura.status,
      ingredientId:
        leitura.matchedName === null ? null : idNoCatalogo(leitura.matchedName),
      candidates: leitura.candidates.map((inciName) => ({
        ingredientId: idNoCatalogo(inciName),
        inciName,
      })),
      match: localizarNoTexto(textos, leitura.rawName),
    }),
  );

  return {
    id: produto.id,
    name: produto.nome,
    brand: produto.marca,
    category: produto.categoria,
    submittedBy: produto.quemEnviou,
    submittedAt: new Date(Date.now() - produto.diasAtras * UM_DIA).toISOString(),
    origin: "ocr",
    ingredientCount: ingredients.length,
    newIngredientCount: ingredients.filter((item) => item.status === "new")
      .length,
    ambiguousIngredientCount: ingredients.filter(
      (item) => item.status === "ambiguous",
    ).length,
    sources: {
      front: { photoUrl: null, rawText: textos.front },
      back: { photoUrl: null, rawText: textos.back },
    },
    ingredients,
  };
}

const PRODUTOS: ProdutoDoMock[] = [
  {
    id: "scan-cuide-se-bem",
    nome: "Cuide-se Bem Rosa e Algodão",
    marca: "O Boticário",
    categoria: "Corpo",
    quemEnviou: "Laura Gonçalves",
    diasAtras: 5,
    frente: [
      "oBOTICARIO",
      "NOVA FORMULA",
      "CUIDE-SE",
      "BEM",
      "ROSA E ALGODÃO",
      "ROSE & COTTON",
      "body splash",
      "desodorante colônia",
      "VEGANO VEGAN",
      "PELE PERFUMADA",
      "COM PLÁSTICO RECICLADO",
      "200 ml - 6.7 fl.oz.",
    ],
    verso: [
      "INGREDIENTES/INGREDIENTS: ALCOHOL DENAT;",
      "AQUA (WATER); PARFUM (FRAGRANCE);",
      "ETHYLHEXYL SALICYLATE; BUTYL",
      "METHOXYDIBENZOYLMETHANE; POLYGLYCERYL-3",
      "CAPRYLATE; CI 17200 (RED 33); SODIUM CHLORIDE;",
      "SODIUM SULFATE; CITRAL; CITRONELLOL;",
      "COUMARlN; GERANIOL; LIMONENE; LINALOOL.",
    ],
    leituras: [
      apelido("ALCOHOL DENAT", "Alcohol Denat."),
      conhecido("AQUA", "Aqua"),
      conhecido("PARFUM", "Parfum"),
      conhecido("ETHYLHEXYL SALICYLATE", "Ethylhexyl Salicylate"),
      conhecido("BUTYL METHOXYDIBENZOYLMETHANE", "Butyl Methoxydibenzoylmethane"),
      conhecido("POLYGLYCERYL-3 CAPRYLATE", "Polyglyceryl-3 Caprylate"),
      conhecido("CI 17200", "CI 17200"),
      conhecido("SODIUM CHLORIDE", "Sodium Chloride"),
      conhecido("SODIUM SULFATE", "Sodium Sulfate"),
      conhecido("CITRAL", "Citral"),
      conhecido("CITRONELLOL", "Citronellol"),
      novo("COUMARlN"),
      conhecido("GERANIOL", "Geraniol"),
      conhecido("LIMONENE", "Limonene"),
      conhecido("LINALOOL", "Linalool"),
    ],
  },
  {
    id: "scan-gel-limpeza",
    nome: "Gel de Limpeza Facial",
    marca: "Lumina Skin",
    categoria: "Rosto",
    quemEnviou: "Rafael Lopes",
    diasAtras: 4,
    frente: ["LUMINA SKIN", "GEL DE LIMPEZA FACIAL", "PELE MISTA A OLEOSA", "150 ml"],
    verso: [
      "INGREDIENTES: AQUA, SODIUM LAURETH SULFATE, COCAMIDOPROPYL BETAINE,",
      "GLYCERIN, NIACINAMIDE, SODIUM BENZOATE.",
    ],
    leituras: [
      conhecido("AQUA", "Aqua"),
      conhecido("SODIUM LAURETH SULFATE", "Sodium Laureth Sulfate"),
      conhecido("COCAMIDOPROPYL BETAINE", "Cocamidopropyl Betaine"),
      conhecido("GLYCERIN", "Glycerin"),
      conhecido("NIACINAMIDE", "Niacinamide"),
      conhecido("SODIUM BENZOATE", "Sodium Benzoate"),
    ],
  },
  {
    id: "scan-condicionador",
    nome: "Condicionador Cacheados",
    marca: "Kapil",
    categoria: "Cabelo",
    quemEnviou: "Sophia Lopes",
    diasAtras: 3,
    frente: ["KAPIL", "CONDICIONADOR", "CACHEADOS", "300 ml"],
    verso: [
      "INGREDIENTES: AQUA; CETEARYL ALCOHOL;",
      "BEHENTRIMONIUM CHLORIDE; GLYCERIN;",
      "PANTHENOL; PENTACLETHRA MACROLOBA SEED OIL.",
    ],
    leituras: [
      conhecido("AQUA", "Aqua"),
      conhecido("CETEARYL ALCOHOL", "Cetearyl Alcohol"),
      conhecido("BEHENTRIMONIUM CHLORIDE", "Behentrimonium Chloride"),
      conhecido("GLYCERIN", "Glycerin"),
      ambiguo("PANTHENOL", ["Panthenol", "Dexpanthenol"]),
      novo("PENTACLETHRA MACROLOBA SEED OIL"),
    ],
  },
  {
    id: "scan-protetor-labial",
    nome: "Protetor Labial FPS 30",
    marca: "Solari",
    categoria: "Lábios",
    quemEnviou: "Jonathan Joestar",
    diasAtras: 3,
    frente: ["SOLARI", "PROTETOR LABIAL", "FPS 30", "4,5 g"],
    verso: [
      "RICINUS COMMUNIS SEED OIL, CERA ALBA, OCTOCRYLENE,",
      "ETHYLHEXYL METHOXYCINNAMATE, TOCOPHEROL.",
    ],
    leituras: [
      conhecido("RICINUS COMMUNIS SEED OIL", "Ricinus Communis Seed Oil"),
      conhecido("CERA ALBA", "Cera Alba"),
      conhecido("OCTOCRYLENE", "Octocrylene"),
      conhecido("ETHYLHEXYL METHOXYCINNAMATE", "Ethylhexyl Methoxycinnamate"),
      conhecido("TOCOPHEROL", "Tocopherol"),
    ],
  },
  {
    id: "scan-sabonete",
    nome: "Sabonete Líquido Neutro",
    marca: "Pura",
    categoria: "Corpo",
    quemEnviou: "Matheus Orestes",
    diasAtras: 2,
    frente: ["PURA", "SABONETE LÍQUIDO", "NEUTRO", "250 ml"],
    verso: [
      "INGREDIENTES: AQUA; SODIUM LAURETH SULFATE;",
      "COCAMIDE DEA; SODIUM CHLORIDE; CITRIC ACID.",
    ],
    leituras: [
      conhecido("AQUA", "Aqua"),
      conhecido("SODIUM LAURETH SULFATE", "Sodium Laureth Sulfate"),
      conhecido("COCAMIDE DEA", "Cocamide DEA"),
      conhecido("SODIUM CHLORIDE", "Sodium Chloride"),
      conhecido("CITRIC ACID", "Citric Acid"),
    ],
  },
  {
    id: "scan-esfoliante",
    nome: "Esfoliante de Café",
    marca: "Terra Viva",
    categoria: "Corpo",
    quemEnviou: "Felipe Augusto",
    diasAtras: 1,
    frente: ["TERRA VIVA", "ESFOLIANTE CORPORAL", "CAFÉ", "200 g"],
    verso: [
      "COFFEA ARABICA SEED POWDER, PRUNUS AMYGDALUS DULCIS OIL,",
      "BUTYROSPERMUM PARKII BUTTER, THEOBROMA CACAO SEED BUTTER,",
      "VANILLA PLANIFOLIA FRUIT EXTRACT.",
    ],
    leituras: [
      novo("COFFEA ARABICA SEED POWDER"),
      conhecido("PRUNUS AMYGDALUS DULCIS OIL", "Prunus Amygdalus Dulcis Oil"),
      conhecido("BUTYROSPERMUM PARKII BUTTER", "Butyrospermum Parkii Butter"),
      novo("THEOBROMA CACAO SEED BUTTER"),
      novo("VANILLA PLANIFOLIA FRUIT EXTRACT"),
    ],
  },
  {
    id: "scan-base-liquida",
    nome: "Base Líquida 120",
    marca: "Muse Beauty",
    categoria: "Maquiagem",
    quemEnviou: "Henrique Akira",
    diasAtras: 0,
    frente: ["MUSE BEAUTY", "BASE LÍQUIDA", "TOM 120", "30 ml"],
    verso: [
      "INGREDIENTS: AQUA; CYCLOPENTASILOXANE;",
      "TITANIUM DIOXIDE; GLYCERIN; DIMETHICONE;",
      "CI 77491; PEARL POWDER.",
    ],
    leituras: [
      conhecido("AQUA", "Aqua"),
      conhecido("CYCLOPENTASILOXANE", "Cyclopentasiloxane"),
      conhecido("TITANIUM DIOXIDE", "Titanium Dioxide"),
      conhecido("GLYCERIN", "Glycerin"),
      conhecido("DIMETHICONE", "Dimethicone"),
      ambiguo("CI 77491", ["CI 77491", "Iron Oxides"]),
      novo("PEARL POWDER"),
    ],
  },
];

let pendentes: Candidato[] = PRODUTOS.map(montar);

const falhamNaPrimeiraSincronizacao = new Set(["scan-base-liquida"]);
const aguardandoSincronizacao = new Set<string>();

function opcoes(nomes: string[]): OpcaoDoCatalogo[] {
  return nomes.map((name, indice) => ({ id: indice + 1, name }));
}

const CATALOGO: CatalogoDaRevisao = {
  brands: opcoes([
    "Kapil",
    "Lumina Skin",
    "Muse Beauty",
    "Natura",
    "O Boticário",
    "Pura",
    "Solari",
    "Terra Viva",
  ]),
  categories: opcoes(["Cabelo", "Corpo", "Lábios", "Maquiagem", "Rosto"]),
};

export function catalogoDaRevisaoDoMock(): CatalogoDaRevisao {
  return CATALOGO;
}

function problemaDaDecisao(
  ingrediente: IngredienteInterpretado,
  decisao: DecisaoIngrediente | undefined,
): string | null {
  const onde = `Posição ${ingrediente.position} (${ingrediente.rawName})`;

  if (decisao === undefined && ingrediente.status === "ambiguous") {
    return `${onde}: escolha um dos candidatos.`;
  }

  if (decisao === undefined && ingrediente.status === "new") {
    return `${onde}: decida entre criar ou descartar.`;
  }

  if (decisao === undefined) {
    return null;
  }

  if (
    decisao.action === "link" &&
    ingrediente.status === "ambiguous" &&
    !ingrediente.candidates.some(
      (candidato) => candidato.ingredientId === decisao.ingredientId,
    )
  ) {
    return `${onde}: o ingrediente escolhido não está entre os candidatos.`;
  }

  if (decisao.action === "create" && decisao.inciName.trim() === "") {
    return `${onde}: informe o nome INCI do ingrediente novo.`;
  }

  if (
    decisao.action === "create" &&
    idsDoCatalogo.has(decisao.inciName.trim())
  ) {
    return `${onde}: ${decisao.inciName.trim()} já existe no catálogo.`;
  }

  return null;
}

export function aprovarNoMock(
  id: string,
  aprovacao: AprovacaoCandidato,
): ResultadoAprovacao {
  const candidato = buscarPendenteDoMock(id);

  const problemas = candidato.ingredients.flatMap((ingrediente) => {
    const decisao = aprovacao.ingredients.find(
      (item) => item.position === ingrediente.position,
    );
    const problema = problemaDaDecisao(ingrediente, decisao);

    return problema === null ? [] : [problema];
  });

  const descartados = aprovacao.ingredients.filter(
    (decisao) => decisao.action === "discard",
  ).length;

  if (descartados === candidato.ingredients.length) {
    problemas.push("O produto precisa de pelo menos um ingrediente.");
  }

  if (problemas.length > 0) {
    throw new ErroRevisaoInvalida(problemas);
  }

  tirarDaFilaNoMock(id);

  if (falhamNaPrimeiraSincronizacao.has(id)) {
    falhamNaPrimeiraSincronizacao.delete(id);
    aguardandoSincronizacao.add(id);

    return "sincronizacaoFalhou";
  }

  return "publicado";
}

export function sincronizarNoMock(id: string): ResultadoAprovacao {
  if (!aguardandoSincronizacao.has(id)) {
    throw new ErroCandidatoNaoEncontrado();
  }

  aguardandoSincronizacao.delete(id);

  return "publicado";
}

export function listarPendentesDoMock(): Candidato[] {
  return [...pendentes].sort(
    (a, b) => Date.parse(a.submittedAt) - Date.parse(b.submittedAt),
  );
}

export function buscarPendenteDoMock(id: string): Candidato {
  const encontrado = pendentes.find((candidato) => candidato.id === id);

  if (encontrado === undefined) {
    throw new ErroCandidatoNaoEncontrado();
  }

  return encontrado;
}

export function tirarDaFilaNoMock(id: string): void {
  buscarPendenteDoMock(id);
  pendentes = pendentes.filter((candidato) => candidato.id !== id);
}
