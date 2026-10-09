import type {
  IngredienteDaLista,
  TrechoDosIngredientes,
} from "../types/escanear";
import {
  AVISO_OU_PROPAGANDA,
  CEP,
  CIDADE_E_UF,
  CNPJ,
  CONTATO,
  EMAIL,
  EMPRESA_NA_LINHA,
  ENDERECO_NA_LINHA,
  MARCADORES_DE_FIM,
  MARCADORES_SEMPRE_FORTES,
  ORIGEM,
  PREFIXO_DO_TITULO,
  REGISTRO,
  RUA,
  SITE,
  TELEFONE,
  TITULOS_DA_LISTA,
  TRECHO_DE_CNPJ,
  compactarEspacos,
  contarSinaisQuimicos,
  distanciaDeEdicao,
  ehCodigoDeEmbalagem,
  ehTextoAdministrativo,
  escaparRegex,
  indiceComFronteira,
  limparPontosFinais,
  normalizarOcr,
  normalizarTexto,
  pareceAdministrativo,
  temTextoDeEmbalagem,
} from "./textoDoRotulo";

export const LIMITE_DE_INGREDIENTES = 200;
export const LIMITE_DO_NOME = 300;
export const LIMITE_DO_TRECHO = 20000;

const MAXIMO_DE_LINHAS = 64;
const MAXIMO_DE_RETOMADAS = 2;
const LINHAS_PARA_PROCURAR_RETOMADA = 24;

interface Titulo {
  fim: number;
}

interface Parada {
  motivo: string;
  posicao: number;
}

function normalizarLinhas(linhas: string[]): string[] {
  return linhas
    .map((linha) =>
      compactarEspacos(linha.replace(/\u0000/g, " ").replace(/[\t\r]+/g, " ")),
    )
    .filter((linha) => linha !== "");
}

function sinaisDeLista(linha: string): number {
  const virgulas = (linha.match(/,/g) ?? []).length;

  return contarSinaisQuimicos(linha) + (virgulas >= 2 ? 1 : 0);
}

function tituloExato(texto: string): Titulo | null {
  const linha = normalizarTexto(texto);

  for (const titulo of TITULOS_DA_LISTA) {
    const termo = normalizarTexto(titulo);
    const indice = indiceComFronteira(linha, termo);

    if (indice >= 0) {
      return { fim: indice + termo.length };
    }
  }

  return null;
}

function ajustarTituloDoOcr(texto: string): string {
  return compactarEspacos(
    texto
      .replace(/0/g, "O")
      .replace(/1/g, "I")
      .replace(/5/g, "S")
      .replace(/8/g, "B")
      .replace(/[^A-Z ]/g, " "),
  );
}

function encontrarTitulo(linha: string): Titulo | null {
  if (linha.trim() === "") {
    return null;
  }

  const normalizada = normalizarTexto(linha);
  const exato =
    tituloExato(normalizada) ?? tituloExato(ajustarTituloDoOcr(normalizada));

  if (exato !== null) {
    return exato;
  }

  const palavra = (normalizada.split(" ")[0] ?? "").replace(
    /^[^A-Z]+|[^A-Z]+$/g,
    "",
  );

  if (palavra.length < 6) {
    return null;
  }

  for (const titulo of TITULOS_DA_LISTA) {
    const termo = normalizarTexto(titulo);

    if (termo.includes(" ")) {
      continue;
    }

    const tolerancia = termo.length >= 10 ? 3 : 2;

    if (distanciaDeEdicao(palavra, termo) <= tolerancia) {
      const indice = normalizada.indexOf(palavra);

      if (indice >= 0) {
        return { fim: indice + palavra.length };
      }
    }
  }

  return null;
}

function linhaPareceInicioDaLista(linhas: string[], indice: number): boolean {
  const atual = normalizarTexto(linhas[indice]);

  if (atual === "" || pareceAdministrativo(atual)) {
    return false;
  }

  const sinais = sinaisDeLista(linhas[indice]);

  if (sinais === 0) {
    return false;
  }

  if (sinais >= 2) {
    return true;
  }

  let seguidas = 1;

  for (let i = indice + 1; i < Math.min(linhas.length, indice + 4); i += 1) {
    const proxima = normalizarTexto(linhas[i]);

    if (proxima === "") {
      continue;
    }

    if (pareceAdministrativo(proxima) || sinaisDeLista(linhas[i]) === 0) {
      break;
    }

    seguidas += 1;
  }

  return seguidas >= 2;
}

function removerPrefixoDoTitulo(linha: string): string {
  const valor = normalizarOcr(linha);
  const prefixo = PREFIXO_DO_TITULO.exec(valor);

  return prefixo === null ? valor : valor.slice(prefixo[0].length).trim();
}

function primeiroMarcador(linha: string): Parada | null {
  const normalizada = normalizarTexto(linha);
  let melhor: Parada | null = null;

  for (const marcador of MARCADORES_DE_FIM) {
    const indice = indiceComFronteira(normalizada, normalizarTexto(marcador));

    if (indice >= 0 && (melhor === null || indice < melhor.posicao)) {
      melhor = { motivo: marcador, posicao: indice };
    }
  }

  return melhor;
}

function jaTemConteudo(coletadas: string[]): boolean {
  return compactarEspacos(coletadas.join(" ")).length >= 5;
}

function inicioDaEmpresaAntes(linha: string, barreira: number): number {
  const prefixo = linha.slice(0, barreira);
  const busca = new RegExp(EMPRESA_NA_LINHA.source, "giu");
  let melhor = -1;
  let encontrada = busca.exec(prefixo);

  while (encontrada !== null) {
    if (encontrada.index + encontrada[0].length <= barreira) {
      melhor = encontrada.index;
    }

    encontrada = busca.exec(prefixo);
  }

  return melhor;
}

function detectarFim(linha: string, coletadas: string[]): Parada | null {
  const normalizada = normalizarTexto(linha);

  if (normalizada === "") {
    return null;
  }

  const aviso = AVISO_OU_PROPAGANDA.exec(linha);

  if (aviso !== null) {
    const antes = linha.slice(0, aviso.index);
    const marcador = primeiroMarcador(linha);
    const inicio =
      !/[,;]/.test(antes) && encontrarTitulo(antes) === null
        ? 0
        : Math.min(aviso.index, marcador?.posicao ?? aviso.index);

    return { motivo: "SAFETY_OR_MARKETING", posicao: inicio };
  }

  const marcador = primeiroMarcador(linha);

  if (
    marcador !== null &&
    (jaTemConteudo(coletadas) ||
      MARCADORES_SEMPRE_FORTES.includes(normalizarTexto(marcador.motivo)))
  ) {
    return marcador;
  }

  const origem = ORIGEM.exec(linha);

  if (origem !== null) {
    return { motivo: origem[0], posicao: origem.index };
  }

  const endereco = ENDERECO_NA_LINHA.exec(linha);

  if (endereco !== null && jaTemConteudo(coletadas)) {
    const corte = inicioDaEmpresaAntes(linha, endereco.index);

    return corte >= 0
      ? { motivo: "COMPANY_INLINE", posicao: corte }
      : { motivo: endereco[0], posicao: endereco.index };
  }

  const empresa = EMPRESA_NA_LINHA.exec(linha);

  if (empresa !== null && jaTemConteudo(coletadas)) {
    return { motivo: "COMPANY_INLINE", posicao: empresa.index };
  }

  const cidade = CIDADE_E_UF.exec(linha);

  if (cidade !== null && jaTemConteudo(coletadas)) {
    return { motivo: "CITY_STATE", posicao: cidade.index };
  }

  const trechoDeCnpj = TRECHO_DE_CNPJ.exec(linha);

  if (trechoDeCnpj !== null && jaTemConteudo(coletadas)) {
    return { motivo: "COMPANY_REGISTRATION", posicao: trechoDeCnpj.index };
  }

  const registro = REGISTRO.exec(normalizada);

  if (registro !== null) {
    return { motivo: registro[0], posicao: registro.index };
  }

  if (CNPJ.test(linha)) {
    return { motivo: "CNPJ", posicao: 0 };
  }

  if (CEP.test(linha)) {
    return { motivo: "CEP", posicao: 0 };
  }

  const contato = CONTATO.exec(linha);

  if (contato !== null && jaTemConteudo(coletadas)) {
    return { motivo: "CONTACT_TEXT", posicao: contato.index };
  }

  if (TELEFONE.test(linha)) {
    return { motivo: "PHONE", posicao: 0 };
  }

  if (EMAIL.test(linha)) {
    return { motivo: "EMAIL", posicao: 0 };
  }

  const site = SITE.exec(linha);

  if (site !== null) {
    const rotulo = /\b(?:SITE|WEBSITE|ACESSE|VISITE|VISIT)\s*:?\s*$/i.exec(
      linha.slice(0, site.index),
    );

    return { motivo: "URL", posicao: rotulo?.index ?? site.index };
  }

  const rua = RUA.exec(linha);

  if (rua !== null && (/\d{1,6}/.test(normalizada) || CEP.test(normalizada))) {
    return { motivo: rua[0], posicao: rua.index };
  }

  return null;
}

function indiceAproximadoPeloNormalizado(
  original: string,
  indiceNormalizado: number,
): number {
  if (indiceNormalizado <= 0) {
    return 0;
  }

  let acumulado = "";
  let indice = 0;

  while (indice < original.length) {
    acumulado += normalizarTexto(original[indice]);

    if (acumulado.length >= indiceNormalizado) {
      break;
    }

    indice += 1;
  }

  return Math.min(indice, original.length);
}

function indiceDoMarcadorNoOriginal(original: string, marcador: string): number {
  const termo = marcador.trim();
  const termoNormalizado = normalizarTexto(marcador);

  if (termoNormalizado === "") {
    return -1;
  }

  const direto = original.search(
    new RegExp(`(?<![A-Z0-9])${escaparRegex(termo)}(?![A-Z0-9])`, "i"),
  );

  if (direto >= 0) {
    return direto;
  }

  const normalizado = normalizarTexto(original).search(
    new RegExp(`(?<![A-Z0-9])${escaparRegex(termoNormalizado)}(?![A-Z0-9])`, "i"),
  );

  return normalizado < 0
    ? -1
    : indiceAproximadoPeloNormalizado(original, normalizado);
}

function indiceAproximado(original: string, marcador: string): number {
  const indiceNormalizado = normalizarTexto(original).indexOf(
    normalizarTexto(marcador),
  );

  if (indiceNormalizado < 0) {
    return -1;
  }

  let posicaoOriginal = 0;
  let posicaoNormalizada = 0;

  while (
    posicaoOriginal < original.length &&
    posicaoNormalizada < indiceNormalizado
  ) {
    posicaoNormalizada += normalizarTexto(original[posicaoOriginal]).length;
    posicaoOriginal += 1;
  }

  return Math.min(posicaoOriginal, original.length);
}

function antesDoCorte(linha: string, corte: number): string {
  return corte <= 0 ? "" : linha.slice(0, corte).trim();
}

function prefixoAntesDaParada(linha: string, parada: Parada): string {
  if (["PHONE", "EMAIL", "CNPJ", "CEP"].includes(parada.motivo)) {
    return "";
  }

  if (parada.motivo === "CONTACT_TEXT") {
    return antesDoCorte(linha, linha.search(CONTATO));
  }

  if (parada.motivo === "CITY_STATE") {
    return antesDoCorte(linha, linha.search(CIDADE_E_UF));
  }

  if (parada.motivo === "COMPANY_REGISTRATION") {
    return antesDoCorte(linha, linha.search(TRECHO_DE_CNPJ));
  }

  if (["URL", "SAFETY_OR_MARKETING", "COMPANY_INLINE"].includes(parada.motivo)) {
    return antesDoCorte(linha, parada.posicao);
  }

  const origem = linha.search(ORIGEM);

  if (origem > 0) {
    return linha.slice(0, origem).trim();
  }

  const endereco = linha.search(ENDERECO_NA_LINHA);

  if (endereco > 0) {
    return linha.slice(0, endereco).trim();
  }

  const direto = indiceDoMarcadorNoOriginal(linha, parada.motivo);

  return antesDoCorte(
    linha,
    direto >= 0 ? direto : indiceAproximado(linha, parada.motivo),
  );
}

function localizarRetomada(linhas: string[], inicio: number): number {
  let comecoDaSequencia = -1;
  let sequencia = 0;
  const limite = Math.min(linhas.length, inicio + LINHAS_PARA_PROCURAR_RETOMADA);

  for (let i = inicio; i < limite; i += 1) {
    const normalizada = normalizarTexto(linhas[i]);

    if (normalizada === "") {
      continue;
    }

    if (pareceAdministrativo(normalizada)) {
      comecoDaSequencia = -1;
      sequencia = 0;
      continue;
    }

    const sinais = sinaisDeLista(linhas[i]);

    if (sinais >= 2) {
      return i;
    }

    if (sinais > 0) {
      if (comecoDaSequencia < 0) {
        comecoDaSequencia = i;
      }

      sequencia += 1;

      if (sequencia >= 2) {
        return comecoDaSequencia;
      }
    } else {
      comecoDaSequencia = -1;
      sequencia = 0;
    }
  }

  return -1;
}

function ehSufixoDeEmbalagem(linhas: string[], inicio: number): boolean {
  return linhas
    .slice(inicio)
    .filter((linha) => linha.trim() !== "")
    .every((linha) => ehCodigoDeEmbalagem(linha));
}

export function localizarIngredientes(
  linhasLidas: string[],
): TrechoDosIngredientes {
  const linhas = normalizarLinhas(linhasLidas);
  let inicio = -1;
  let fimDoTitulo = 0;
  let porConteudo = false;

  for (let i = 0; i < linhas.length && inicio < 0; i += 1) {
    const titulo = encontrarTitulo(linhas[i]);

    if (titulo !== null) {
      inicio = i;
      fimDoTitulo = Math.min(linhas[i].length, titulo.fim);
    }
  }

  for (let i = 0; i < linhas.length && inicio < 0; i += 1) {
    if (linhaPareceInicioDaLista(linhas, i)) {
      inicio = i;
      porConteudo = true;
    }
  }

  if (inicio < 0) {
    return { encontrado: false, texto: "" };
  }

  const coletadas: string[] = [];
  let primeira = porConteudo
    ? removerPrefixoDoTitulo(linhas[inicio])
    : linhas[inicio].slice(fimDoTitulo).replace(/^[\s:;.,#-]+/, "").trim();
  let parouNaPrimeira = false;
  let retomadas = 0;

  if (primeira !== "") {
    const parada = detectarFim(primeira, [primeira]);

    if (parada !== null) {
      primeira = prefixoAntesDaParada(primeira, parada);

      if (
        parada.motivo === "SAFETY_OR_MARKETING" &&
        localizarRetomada(linhas, inicio + 1) >= 0
      ) {
        retomadas = 1;
      } else {
        parouNaPrimeira = true;
      }
    }

    if (primeira !== "") {
      coletadas.push(normalizarOcr(primeira));
    }
  }

  for (let i = inicio + 1; !parouNaPrimeira && i < linhas.length; i += 1) {
    if (i - inicio > MAXIMO_DE_LINHAS) {
      break;
    }

    const linha = linhas[i];
    const ultima = coletadas[coletadas.length - 1];

    if (
      ultima !== undefined &&
      ultima.trim().endsWith(".") &&
      ehSufixoDeEmbalagem(linhas, i)
    ) {
      break;
    }

    const parada = detectarFim(linha, coletadas);

    if (parada === null) {
      const limpa = normalizarOcr(linha);

      if (limpa !== "") {
        coletadas.push(limpa);
      }

      continue;
    }

    const antes = prefixoAntesDaParada(linha, parada);

    if (antes !== "") {
      coletadas.push(normalizarOcr(antes));
    }

    const retomada =
      retomadas < MAXIMO_DE_RETOMADAS && parada.motivo === "SAFETY_OR_MARKETING"
        ? localizarRetomada(linhas, i + 1)
        : -1;

    if (retomada < 0) {
      break;
    }

    retomadas += 1;
    i = retomada - 1;
  }

  return {
    encontrado: true,
    texto: limparPontosFinais(compactarEspacos(coletadas.join(" "))),
  };
}

function limparSeparadores(texto: string): string {
  return compactarEspacos(texto)
    .replace(/^[,;|. ]+/, "")
    .replace(/[,;|. ]+$/, "")
    .trim();
}

function separarPartes(texto: string): string[] {
  const preparado = limparPontosFinais(
    compactarEspacos(
      normalizarOcr(texto).replace(
        /(?<=[A-Z0-9)])\.(?=\s*[A-Z][A-Z0-9/-]{2,})/gi,
        ", ",
      ),
    ),
  );

  return preparado
    .split(/\s*[,;|•]\s*/)
    .map(limparSeparadores)
    .filter((parte) => parte !== "");
}

function juntarCodigosDeCor(partes: string[]): string[] {
  const juntas: string[] = [];

  for (const parte of partes) {
    const normalizada = normalizarTexto(parte);
    const anterior = juntas[juntas.length - 1];

    if (normalizada.length === 1) {
      continue;
    }

    if (
      /^[0-9 .:/-]+$/.test(normalizada) &&
      anterior !== undefined &&
      normalizarTexto(anterior) === "CI"
    ) {
      juntas[juntas.length - 1] = compactarEspacos(`${anterior} ${parte}`);
      continue;
    }

    juntas.push(parte);
  }

  return juntas;
}

function limparNome(parte: string): string {
  const nome = compactarEspacos(
    normalizarOcr(parte)
      .replace(/^\d+[.)]\s*/, "")
      .replace(
        /^(?:INGREDIENTES?|INGREDIENTS?|INGREDIENTI|COMPOSICAO|COMPOSITION|COMPOSICION|INCI)\s*[:;.-]?\s*/,
        "",
      )
      .replace(/^[,;|.\- ]+/, "")
      .replace(/[,;|. ]+$/, ""),
  )
    .replace(/^(?:INGREDIENTS?|INGREDIENTES?)\s+/, "")
    .replace(/^[:;,.-]+\s*/, "")
    .replace(/\s*[:;]\s*/g, " ");

  return compactarEspacos(nome);
}

function pareceEmbalagem(nome: string): boolean {
  return (
    temTextoDeEmbalagem(nome) ||
    ehTextoAdministrativo(nome) ||
    ENDERECO_NA_LINHA.test(nome) ||
    EMPRESA_NA_LINHA.test(nome) ||
    TELEFONE.test(nome) ||
    EMAIL.test(nome) ||
    SITE.test(nome) ||
    CONTATO.test(nome)
  );
}

export function montarListaDeIngredientes(texto: string): IngredienteDaLista[] {
  const nomes = juntarCodigosDeCor(separarPartes(texto))
    .map(limparNome)
    .filter((nome) => nome.length >= 2);

  return [...new Set(nomes)].map((nome, indice) => ({
    position: indice + 1,
    rawName: nome,
    looksLikePackaging: pareceEmbalagem(nome),
  }));
}

export function validarLista(
  texto: string,
  lista: IngredienteDaLista[],
): string | null {
  if (texto.trim() === "" || lista.length === 0) {
    return "Nenhum ingrediente foi separado. Confira o trecho lido.";
  }

  if (texto.length > LIMITE_DO_TRECHO) {
    return `O trecho passou de ${LIMITE_DO_TRECHO} caracteres.`;
  }

  if (lista.length > LIMITE_DE_INGREDIENTES) {
    return `A lista passou de ${LIMITE_DE_INGREDIENTES} ingredientes.`;
  }

  if (lista.some((item) => item.rawName.length > LIMITE_DO_NOME)) {
    return `Um ingrediente passou de ${LIMITE_DO_NOME} caracteres. Confira se faltou alguma vírgula.`;
  }

  return null;
}
