export const TITULOS_DA_LISTA: readonly string[] = [
  "INGREDIENTES",
  "INGREDIENTE",
  "INGREDIENTS",
  "INGREDIENT",
  "INGREDIENTI",
  "COMPOSICAO",
  "COMPOSITION",
  "COMPOSICION",
  "COMPOSICION INCI",
  "COMPOSICAO INCI",
  "INCI",
];

export const MARCADORES_DE_FIM: readonly string[] = [
  "LOT",
  "CONTEUDO",
  "PESO LIQUIDO",
  "VOLUME",
  "FABRICADO POR",
  "FABRICADO",
  "FABRICANTE",
  "MANUFACTURER",
  "MANUFACTURED BY",
  "MANUFACTURED",
  "PRODUZIDO POR",
  "PRODUZIDO",
  "MANUFACTURADO POR",
  "ELABORADO POR",
  "ELABORADO",
  "IMPORTADO POR",
  "IMPORTADO",
  "IMPORTADOR",
  "IMPORTED BY",
  "IMPORTED",
  "DISTRIBUIDO POR",
  "DISTRIBUIDO",
  "DISTRIBUIDORA",
  "DISTRIBUTOR",
  "DISTRIBUTED BY",
  "CNPJ",
  "CEP",
  "AUTFUNC",
  "AUT FUNC",
  "AUT. FUNC",
  "AUTORIZACAO",
  "REGISTRO ANVISA",
  "NUMERO DE REGISTRO",
  "PROCESSO ANVISA",
  "CODIGO DE BARRAS",
  "CODIGO EAN",
  "EAN",
  "GTIN",
  "LOTE",
  "BATCH",
  "VALIDADE",
  "VENCIMENTO",
  "EXPIRY",
  "MODO DE USO",
  "MODO DE USAR",
  "MODO DE EMPLEO",
  "INSTRUCOES DE USO",
  "COMO USAR",
  "COMO UTILIZAR",
  "HOW TO USE",
  "DIRECTIONS FOR USE",
  "PRECAUCOES",
  "PRECAUCAO",
  "PRECAUTIONS",
  "CAUTIONS",
  "CUIDADOS",
  "CUIDADO",
  "ADVERTENCIA",
  "ADVERTENCIAS",
  "WARNING",
  "WARNINGS",
  "SAC",
  "ATENDIMENTO AO CONSUMIDOR",
  "CENTRAL DE ATENDIMENTO",
  "WHATSAPP",
  "QUESTIONS",
  "QUESTION",
  "CUSTOMER SERVICE",
  "CONTACT",
  "INDUSTRIA BRASILEIRA",
  "PAIS DE ORIGEM",
  "MADE IN",
  "ORIGIN",
];

export const MARCADORES_SEMPRE_FORTES: readonly string[] = [
  "CNPJ",
  "CEP",
  "AUTFUNC",
  "AUT FUNC",
  "AUTORIZACAO",
  "REGISTRO ANVISA",
  "NUMERO DE REGISTRO",
  "CODIGO DE BARRAS",
  "GTIN",
  "EAN",
  "LOTE",
  "BATCH",
  "VALIDADE",
  "VENCIMENTO",
  "SAC",
  "ATENDIMENTO AO CONSUMIDOR",
  "WHATSAPP",
];

const TERMOS_ADMINISTRATIVOS: readonly string[] = [
  "CNPJ",
  "CEP",
  "AUTFUNC",
  "AUT FUNC",
  "AUTORIZACAO",
  "REGISTRO",
  "PROCESSO",
  "LOTE",
  "BATCH",
  "VALIDADE",
  "VENCIMENTO",
  "EXPIRY",
  "SAC",
  "ATENDIMENTO",
  "CONSUMIDOR",
  "WHATSAPP",
  "IMPORTADO",
  "DISTRIBUIDO",
  "FABRICADO",
  "INDUSTRIA BRASILEIRA",
  "INDUSTRIA",
  "RUA",
  "AVENIDA",
  "CALLE",
  "CARRERA",
  "PISO",
  "PAIS DE ORIGEM",
  "MADE IN",
  "WWW.",
  "HTTP",
  "HTTPS",
  "LTDA",
  "LTD",
  "S/A",
  "S A",
  "SAS",
  "SRL",
  "LLC",
  "INC",
  "CORP",
  "CORPORATION",
  "PLC",
  "GMBH",
  "EIRELI",
];

export const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;

export const ENDERECO_NA_LINHA =
  /\b(?:RUA|R\.?|AVENIDA|AV\.?|ALAMEDA|TRAVESSA|RODOVIA|CALLE|CARRERA|JIRON|BOULEVARD|BLVD)\b/i;

export const CONTATO =
  /\b(?:QUESTIONS{0,2}|CONTACT|CUSTOMER\s+SERVICE|ATENDIMENTO(?:\s+AO\s+CONSUMIDOR)?|MAIL\s+SUPPORT|E[- ]?MAIL)[^\n]{0,180}?(?:@|MAIL|E[- ]?MAIL|SUPPORT|CALL|PHONE|FONE)[^\n]{0,140}/i;

export const EMPRESA_NA_LINHA =
  /\b(?:\p{L}[\p{L}0-9'&.-]{1,}\s+){1,4}(?:LTDA|LTD|S\.?A\.?|S\/A|SA|SAS|SRL|LLC|INC|CORP|CORPORATION|PLC|BV|NV|GMBH|AG|KG|SPA|EIRELI|ME)\b/iu;

export const SITE =
  /(?<![a-z0-9@._-])(?:(?:https?:\/\/|www\.)[a-z0-9][a-z0-9.-]*|(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:com|org|net|edu|gov|br|pt|uk|us|fr|de|it|es|eu))(?![a-z0-9_-]|\.[a-z])(?:\/[a-z0-9._~:/?#[\]@!$&'()*+,;=%-]*)?/i;

export const TELEFONE =
  /(?<!\d)(?:\+?\d{1,3}[ .-]?)?(?:\(?\d{2}\)?[ .-]?)?(?:9?\d{4})[ .-]?\d{4}(?!\d)/;

export const CNPJ =
  /(?<!\d)\d{2}[ .-]?\d{3}[ .-]?\d{3}[/. -]?\d{4}[- .]?\d{2}(?!\d)/;

export const CEP = /(?<!\d)\d{5}[ .-]?\d{3}(?!\d)/;

export const REGISTRO =
  /\b(?:REGISTRO(?:\s+ANVISA)?|REGISTRATION|PROCESSO(?:\s+ANVISA)?|AUT\s*FUNC|AUT\.?\s*FUNC|AUTL?FUNC|AUTORIZACAO|NUMERO\s+DE\s+REGISTRO)\b/i;

export const RUA =
  /\b(?:RUA|AVENIDA|AV|ALAMEDA|TRAVESSA|RODOVIA|CALLE|CARRERA|JIRON|BOULEVARD|BLVD)\b/i;

export const CIDADE_E_UF =
  /\b[A-ZÁÉÍÓÚÃÕÇ]{3,}(?:\s+[A-ZÁÉÍÓÚÃÕÇ]{2,}){0,6}\s*\/\s*[A-Z]{2}\b/i;

export const TRECHO_DE_CNPJ = /(?<!\d)\d{2,4}\s*\/\s*[A-Z0-9]{3,8}/i;

export const ORIGEM =
  /\b(?:HECHO\s+EN|FEITO\s+NO|MADE\s+IN|FABRICADO\s+NO|ORIGEM)\b/i;

export const AVISO_OU_PROPAGANDA =
  /\b(?:PROCURAR\s+ORIENTA[ÇC][ÃA]O\s+M[EÉ]DICA|N[ÃA]O\s+CONT[EÉ]M\s+CFC|(?:MAIS|M[AÁ]S)\s+VENDIDO|MERCADO\s+DE\s+DESODORANTES|ALERGIA|PRURIDO|IRRITA[ÇC][ÃA]O|VIDE\s+FUNDO)\b/i;

export const PREFIXO_DO_TITULO =
  /^(?:N?GREDIENTES(?:INGREDIENTS|INGREDIENTES)?|INGREDIENTES(?:INGREDIENTS)?|INGREDIENTS(?:INGREDIENTES)?)\s*[:;.,#-]*\s*/i;

const SINAIS_QUIMICOS: readonly RegExp[] = [
  /\b[A-Z]{4,}-[A-Z0-9-]{2,}\b/,
  /\b[A-Z]{6,}(?:OL|ONE|ATE|IDE|IUM|IC|YL)\b/,
  /\bCI\s*\d{3,6}\b/,
];

const TEXTO_DE_EMBALAGEM =
  /\b(?:LTDA|CNPJ|CEP|WHATSAPP|WWW|HTTPS?|SAC|LOTE|BATCH)\b/;

export function semAcento(texto: string): string {
  return texto.normalize("NFD").replace(/\p{M}+/gu, "");
}

export function compactarEspacos(texto: string): string {
  return texto.replace(/\s+/g, " ").trim();
}

export function normalizarTexto(texto: string): string {
  return compactarEspacos(
    semAcento(texto)
      .toUpperCase()
      .replace(/[^A-Z0-9./:%+@#&' -]/g, " "),
  );
}

export function normalizarOcr(texto: string): string {
  return compactarEspacos(
    texto
      .replace(/\u0000/g, " ")
      .replace(/’/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/[–—]/g, "-")
      .replace(/[\t\r\n]+/g, " "),
  );
}

export function limparPontosFinais(texto: string): string {
  return texto.replace(/[. ]+$/, "").trim();
}

function ehLetraOuNumero(caractere: string | undefined): boolean {
  return caractere !== undefined && /[\p{L}\p{N}]/u.test(caractere);
}

export function indiceComFronteira(texto: string, marcador: string): number {
  if (marcador === "") {
    return -1;
  }

  let indice = texto.indexOf(marcador);

  while (indice >= 0) {
    const fim = indice + marcador.length;

    if (!ehLetraOuNumero(texto[indice - 1]) && !ehLetraOuNumero(texto[fim])) {
      return indice;
    }

    indice = texto.indexOf(marcador, indice + 1);
  }

  return -1;
}

export function contemTermo(texto: string, termo: string): boolean {
  return indiceComFronteira(normalizarTexto(texto), normalizarTexto(termo)) >= 0;
}

export function escaparRegex(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function distanciaDeEdicao(a: string, b: string): number {
  let anterior = Array.from({ length: b.length + 1 }, (_, j) => j);

  for (let i = 1; i <= a.length; i += 1) {
    const atual = [i];

    for (let j = 1; j <= b.length; j += 1) {
      const custo = a[i - 1] === b[j - 1] ? 0 : 1;

      atual[j] = Math.min(atual[j - 1] + 1, anterior[j] + 1, anterior[j - 1] + custo);
    }

    anterior = atual;
  }

  return anterior[b.length];
}

export function contarSinaisQuimicos(linha: string): number {
  const normalizada = normalizarTexto(linha);

  return SINAIS_QUIMICOS.filter((padrao) => padrao.test(normalizada)).length;
}

export function pareceAdministrativo(linha: string): boolean {
  const normalizada = normalizarTexto(linha);

  if (CNPJ.test(normalizada) || CEP.test(normalizada)) {
    return true;
  }

  if (
    TELEFONE.test(normalizada) &&
    !/\b(?:AQUA|WATER|ALCOHOL)\b/.test(normalizada)
  ) {
    return true;
  }

  return TERMOS_ADMINISTRATIVOS.some((termo) => contemTermo(normalizada, termo));
}

export function ehTextoAdministrativo(texto: string): boolean {
  const normalizado = normalizarTexto(texto);

  return (
    CNPJ.test(normalizado) ||
    CEP.test(normalizado) ||
    CONTATO.test(normalizado) ||
    TERMOS_ADMINISTRATIVOS.some((termo) => contemTermo(normalizado, termo))
  );
}

export function temTextoDeEmbalagem(texto: string): boolean {
  return TEXTO_DE_EMBALAGEM.test(compactarEspacos(semAcento(texto).toUpperCase()));
}

export function ehCodigoDeEmbalagem(linha: string): boolean {
  const valor = compactarEspacos(semAcento(linha).toUpperCase());

  if (temTextoDeEmbalagem(valor)) {
    return true;
  }

  const compacto = valor.replace(/ /g, "");

  return (
    !/^(?:CI|PEG|PPG|C[0-9])/.test(valor) &&
    /^[A-Z0-9]{4,14}$/.test(compacto) &&
    /[0-9]/.test(compacto) &&
    compacto.replace(/[0-9]/g, "").length <= 4
  );
}
