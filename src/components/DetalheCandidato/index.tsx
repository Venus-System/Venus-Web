import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import Button from "../Button";
import CamposProduto, {
  ID_CATEGORIA,
  ID_MARCA,
  ID_NOME_DO_PRODUTO,
} from "../CamposProduto";
import type { ErrosDoProduto } from "../CamposProduto";
import ListaIngredientes from "../ListaIngredientes";
import PainelFonte from "../PainelFonte";
import type { VisaoDaFonte } from "../PainelFonte";
import RevisaoIngrediente, {
  OPCAO_CRIAR,
  OPCAO_DESCARTAR,
  idDaDecisao,
  idDoNomeInci,
} from "../RevisaoIngrediente";
import type { EscolhaDoIngrediente } from "../RevisaoIngrediente";
import Selo from "../Selo";
import type { EstadoCatalogo } from "../../hooks/useCatalogoDaRevisao";
import type {
  AprovacaoCandidato,
  Candidato,
  DecisaoIngrediente,
  IngredienteInterpretado,
  LadoEmbalagem,
} from "../../types/admin";
import { nomeCurto } from "../../utils/nomeCurto";
import { sugerirDoCatalogo } from "../../utils/sugerirDoCatalogo";
import { tempoRelativo } from "../../utils/tempoRelativo";
import {
  validarCategoria,
  validarDecisaoDoIngrediente,
  validarMarca,
  validarNomeDoProduto,
  validarNomeInci,
} from "../../utils/validacao";
import styles from "./styles.module.css";

interface DetalheCandidatoProps {
  candidato: Candidato;
  rotuloDaOrigem: string;
  rotuloDosNovos: string;
  catalogo: EstadoCatalogo;
  podeDecidir: boolean;
  enviando: boolean;
  semSincronizar: boolean;
  mensagemDeErro: string;
  detalhesDoErro: string[];
  onTentarCatalogo: () => void;
  onAprovar: (aprovacao: AprovacaoCandidato) => void;
  onRecusar: () => void;
  onSincronizar: () => void;
}

interface EstadoDaVisao {
  visao: VisaoDaFonte;
  fotosVistas: Record<LadoEmbalagem, boolean>;
  selecionado: string | null;
  anuncio: string;
}

interface CamposDaRevisao {
  nome: string;
  marcaId: string | null;
  categoriaId: string | null;
  errosDoProduto: ErrosDoProduto;
  escolhas: EscolhaDoIngrediente[];
  aviso: string;
}

const NOME_DO_LADO: Record<LadoEmbalagem, string> = {
  front: "frente",
  back: "verso",
};

const SEM_ERROS_DO_PRODUTO: ErrosDoProduto = {
  nome: null,
  marca: null,
  categoria: null,
};

const ID_AVISO_DO_PAPEL = "aviso-do-papel";
const ID_AVISO_DAS_FOTOS = "aviso-das-fotos";

const LADOS: LadoEmbalagem[] = ["front", "back"];

const FOTO_DO_LADO: Record<LadoEmbalagem, string> = {
  front: "a foto da frente",
  back: "a foto do verso",
};

const ID_DO_BOTAO_DO_LADO: Record<LadoEmbalagem, string> = {
  front: "fonte-lado",
  back: "fonte-lado-back",
};

function avisoDasFotos(faltando: LadoEmbalagem[]): string {
  const fotos = faltando.map((lado) => FOTO_DO_LADO[lado]).join(" e ");

  return `Abra ${fotos} antes de aprovar.`;
}

function precisaDecidir(ingrediente: IngredienteInterpretado): boolean {
  return ingrediente.status === "ambiguous" || ingrediente.status === "new";
}

function escolhaInicial(
  ingrediente: IngredienteInterpretado,
): EscolhaDoIngrediente {
  return {
    position: ingrediente.position,
    opcao: "",
    inciName: ingrediente.rawName,
    erro: null,
    erroDoNome: null,
  };
}

function validarEscolha(escolha: EscolhaDoIngrediente): EscolhaDoIngrediente {
  return {
    ...escolha,
    erro: validarDecisaoDoIngrediente(escolha.opcao),
    erroDoNome:
      escolha.opcao === OPCAO_CRIAR ? validarNomeInci(escolha.inciName) : null,
  };
}

function paraDecisao(escolha: EscolhaDoIngrediente): DecisaoIngrediente {
  if (escolha.opcao === OPCAO_DESCARTAR) {
    return { position: escolha.position, action: "discard" };
  }

  if (escolha.opcao === OPCAO_CRIAR) {
    return {
      position: escolha.position,
      action: "create",
      inciName: escolha.inciName.trim(),
    };
  }

  return {
    position: escolha.position,
    action: "link",
    ingredientId: Number(escolha.opcao),
  };
}

function primeiroInvalido(
  erros: ErrosDoProduto,
  pendentes: IngredienteInterpretado[],
  escolhas: EscolhaDoIngrediente[],
): string | null {
  if (erros.nome !== null) {
    return ID_NOME_DO_PRODUTO;
  }

  if (erros.marca !== null) {
    return ID_MARCA;
  }

  if (erros.categoria !== null) {
    return ID_CATEGORIA;
  }

  for (const ingrediente of pendentes) {
    const escolha = escolhas.find(
      (item) => item.position === ingrediente.position,
    );

    if (escolha?.erro) {
      return idDaDecisao(ingrediente);
    }

    if (escolha?.erroDoNome) {
      return idDoNomeInci(ingrediente);
    }
  }

  return null;
}

function avisoDoRodape(faltam: number): string {
  if (faltam === 0) {
    return "Tudo decidido. Aprovar publica o produto no catálogo.";
  }

  if (faltam === 1) {
    return "Falta decidir 1 ingrediente antes de aprovar.";
  }

  return `Falta decidir ${faltam} ingredientes antes de aprovar.`;
}

function DetalheCandidato({
  candidato,
  rotuloDaOrigem,
  rotuloDosNovos,
  catalogo,
  podeDecidir,
  enviando,
  semSincronizar,
  mensagemDeErro,
  detalhesDoErro,
  onTentarCatalogo,
  onAprovar,
  onRecusar,
  onSincronizar,
}: DetalheCandidatoProps) {
  const pendentes = candidato.ingredients.filter(precisaDecidir);
  const temFoto = (lado: LadoEmbalagem) =>
    candidato.sources[lado].photoUrl !== null;

  const [visao, setVisao] = useState<EstadoDaVisao>({
    visao: {
      lado: "front",
      formato: temFoto("front") ? "foto" : "texto",
    },
    fotosVistas: { front: false, back: false },
    selecionado: null,
    anuncio: "",
  });
  const [campos, setCampos] = useState<CamposDaRevisao>({
    nome: candidato.name,
    marcaId: null,
    categoriaId: null,
    errosDoProduto: SEM_ERROS_DO_PRODUTO,
    escolhas: pendentes.map(escolhaInicial),
    aviso: "",
  });
  const tituloRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    tituloRef.current?.focus();
  }, []);

  const ativo = candidato.ingredients.find(
    (ingrediente) => ingrediente.id === visao.selecionado,
  );

  const valoresDoProduto = {
    nome: campos.nome,
    marcaId:
      campos.marcaId ??
      (catalogo.status === "pronto"
        ? sugerirDoCatalogo(catalogo.catalogo.brands, candidato.brand)
        : ""),
    categoriaId:
      campos.categoriaId ??
      (catalogo.status === "pronto"
        ? sugerirDoCatalogo(catalogo.catalogo.categories, candidato.category)
        : ""),
  };

  const faltam = campos.escolhas.filter((escolha) => escolha.opcao === "")
    .length;

  const fotosFaltando = LADOS.filter(
    (lado) => temFoto(lado) && !visao.fotosVistas[lado],
  );

  function trocarVisao(nova: VisaoDaFonte) {
    setVisao((atual) => ({ ...atual, visao: nova }));
  }

  function marcarFotoAberta(lado: LadoEmbalagem) {
    setVisao((atual) =>
      atual.fotosVistas[lado]
        ? atual
        : { ...atual, fotosVistas: { ...atual.fotosVistas, [lado]: true } },
    );
  }

  function selecionar(id: string) {
    const ingrediente = candidato.ingredients.find((item) => item.id === id);

    if (ingrediente === undefined) {
      return;
    }

    if (visao.selecionado === id) {
      setVisao((atual) => ({
        ...atual,
        selecionado: null,
        anuncio: "Destaque removido.",
      }));
      return;
    }

    const trecho = ingrediente.match;

    setVisao((atual) => ({
      ...atual,
      visao:
        trecho === null ? atual.visao : { lado: trecho.side, formato: "texto" },
      selecionado: id,
      anuncio:
        trecho === null
          ? `${ingrediente.name} não aparece no texto lido.`
          : `${ingrediente.name} destacado no texto do ${NOME_DO_LADO[trecho.side]}.`,
    }));
  }

  function mudarEscolha(nova: EscolhaDoIngrediente) {
    setCampos((atual) => ({
      ...atual,
      escolhas: atual.escolhas.map((escolha) =>
        escolha.position === nova.position ? nova : escolha,
      ),
    }));
  }

  function aprovar() {
    if (!podeDecidir || enviando) {
      return;
    }

    if (fotosFaltando.length > 0) {
      setVisao((atual) => ({
        ...atual,
        anuncio: avisoDasFotos(fotosFaltando),
      }));
      document.getElementById(ID_DO_BOTAO_DO_LADO[fotosFaltando[0]])?.focus();
      return;
    }

    if (catalogo.status !== "pronto") {
      setCampos((atual) => ({
        ...atual,
        aviso: "Espere as marcas e categorias carregarem para aprovar.",
      }));
      return;
    }

    const errosDoProduto = {
      nome: validarNomeDoProduto(valoresDoProduto.nome),
      marca: validarMarca(valoresDoProduto.marcaId),
      categoria: validarCategoria(valoresDoProduto.categoriaId),
    };
    const escolhas = campos.escolhas.map(validarEscolha);

    setCampos((atual) => ({ ...atual, errosDoProduto, escolhas, aviso: "" }));

    const invalido = primeiroInvalido(errosDoProduto, pendentes, escolhas);

    if (invalido !== null) {
      document.getElementById(invalido)?.focus();
      return;
    }

    onAprovar({
      product: {
        name: valoresDoProduto.nome.trim(),
        brandId: Number(valoresDoProduto.marcaId),
        productCategoryId: Number(valoresDoProduto.categoriaId),
      },
      ingredients: escolhas.map(paraDecisao),
    });
  }

  function recusar() {
    if (podeDecidir && !enviando) {
      onRecusar();
    }
  }

  const descricaoDosBotoes = podeDecidir ? undefined : ID_AVISO_DO_PAPEL;
  const bloqueadoPelasFotos = podeDecidir && fotosFaltando.length > 0;
  const descricaoDoAprovar = bloqueadoPelasFotos
    ? ID_AVISO_DAS_FOTOS
    : descricaoDosBotoes;

  return (
    <article className={styles.detalhe} aria-labelledby="titulo-candidato">
      <header className={styles.cabecalho}>
        <div className={styles.identidade}>
          <h2
            id="titulo-candidato"
            ref={tituloRef}
            className={styles.titulo}
            tabIndex={-1}
          >
            {candidato.name}
          </h2>

          <p className={styles.meta}>
            {candidato.brand}
            <span aria-hidden="true"> · </span>
            {candidato.category}
            <span aria-hidden="true"> · </span>
            enviado por {nomeCurto(candidato.submittedBy)}{" "}
            <time dateTime={candidato.submittedAt}>
              {tempoRelativo(candidato.submittedAt)}
            </time>
          </p>
        </div>

        <div className={styles.selos}>
          <Selo label={rotuloDaOrigem} />
          <Selo
            label={`${candidato.ingredientCount} ingredientes · ${rotuloDosNovos}`}
            variant={pendentes.length > 0 ? "destaque" : "contorno"}
          />
        </div>
      </header>

      <p className="texto-oculto" aria-live="polite">
        {visao.anuncio}
      </p>

      <div className={styles.paineis}>
        <PainelFonte
          fontes={candidato.sources}
          origem={candidato.origin}
          visao={visao.visao}
          destaque={ativo === undefined ? null : ativo.match}
          onTrocarVisao={trocarVisao}
          onFotoAberta={marcarFotoAberta}
        />

        <ListaIngredientes
          ingredientes={candidato.ingredients}
          selecionado={visao.selecionado}
          onSelecionar={selecionar}
        />
      </div>

      <div className={styles.revisao}>
        <CamposProduto
          valores={valoresDoProduto}
          erros={campos.errosDoProduto}
          marcaLida={candidato.brand}
          categoriaLida={candidato.category}
          catalogo={catalogo}
          onMudar={(valores) =>
            setCampos((atual) => ({
              ...atual,
              nome: valores.nome,
              marcaId: valores.marcaId,
              categoriaId: valores.categoriaId,
              errosDoProduto: SEM_ERROS_DO_PRODUTO,
            }))
          }
          onTentarDeNovo={onTentarCatalogo}
        />

        <section aria-labelledby="titulo-decisoes">
          <h3 id="titulo-decisoes" className={styles.subtitulo}>
            Ingredientes para decidir
          </h3>

          <p className={styles.dica}>
            {pendentes.length === 0
              ? "Nenhum ingrediente precisa de decisão. Os conhecidos entram como estão."
              : "Os conhecidos entram como estão. Decida o que fazer com os ambíguos e os novos."}
          </p>

          {pendentes.map((ingrediente) => {
            const escolha =
              campos.escolhas.find(
                (item) => item.position === ingrediente.position,
              ) ?? escolhaInicial(ingrediente);

            return (
              <RevisaoIngrediente
                key={ingrediente.id}
                ingrediente={ingrediente}
                escolha={escolha}
                onMudar={mudarEscolha}
              />
            );
          })}
        </section>
      </div>

      <footer className={styles.rodape}>
        <div className={styles.rodapeTexto}>
          <p>
            {semSincronizar
              ? "Aprovado, mas o produto ainda não entrou no catálogo. A API não conseguiu publicar agora."
              : avisoDoRodape(faltam)}
          </p>

          {podeDecidir ? null : (
            <p id={ID_AVISO_DO_PAPEL}>
              Como analista, você pode revisar a fila, mas só moderação e
              administração aprovam ou recusam.
            </p>
          )}

          {bloqueadoPelasFotos ? (
            <p id={ID_AVISO_DAS_FOTOS}>{avisoDasFotos(fotosFaltando)}</p>
          ) : null}

          {campos.aviso === "" ? null : (
            <p className={styles.erro} role="alert">
              {campos.aviso}
            </p>
          )}

          {mensagemDeErro === "" ? null : (
            <div className={styles.erro} role="alert">
              <p>{mensagemDeErro}</p>

              {detalhesDoErro.length === 0 ? null : (
                <ul className={styles.detalhes}>
                  {detalhesDoErro.map((detalhe) => (
                    <li key={detalhe}>{detalhe}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className={styles.acoes}>
          {semSincronizar ? (
            <Button onClick={onSincronizar} disabled={enviando}>
              {enviando ? "Publicando..." : "Tentar de novo"}
            </Button>
          ) : (
            <>
              <Button
                variant="danger"
                onClick={recusar}
                disabled={enviando}
                aria-disabled={podeDecidir ? undefined : true}
                aria-describedby={descricaoDosBotoes}
              >
                Recusar
              </Button>

              <Button
                onClick={aprovar}
                disabled={enviando}
                aria-disabled={
                  !podeDecidir || bloqueadoPelasFotos ? true : undefined
                }
                aria-describedby={descricaoDoAprovar}
              >
                {enviando ? "Salvando..." : "Aprovar"}
                {enviando ? null : (
                  <ArrowRight className={styles.icone} aria-hidden="true" />
                )}
              </Button>
            </>
          )}
        </div>
      </footer>
    </article>
  );
}

export default DetalheCandidato;
