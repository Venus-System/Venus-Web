import { useEffect, useRef, useState } from "react";
import GrupoRadio from "../GrupoRadio";
import type { RadioOption } from "../GrupoRadio";
import type {
  FonteDoLado,
  LadoEmbalagem,
  OrigemCandidato,
  TrechoNoTexto,
} from "../../types/admin";
import styles from "./styles.module.css";

export type FormatoFonte = "foto" | "texto";

export interface VisaoDaFonte {
  lado: LadoEmbalagem;
  formato: FormatoFonte;
}

interface PainelFonteProps {
  fontes: Record<LadoEmbalagem, FonteDoLado>;
  origem: OrigemCandidato;
  visao: VisaoDaFonte;
  destaque: TrechoNoTexto | null;
  onTrocarVisao: (visao: VisaoDaFonte) => void;
  onFotoAberta: (lado: LadoEmbalagem) => void;
}

const OPCOES_LADO: RadioOption<LadoEmbalagem>[] = [
  { value: "front", label: "Frente" },
  { value: "back", label: "Verso" },
];

const OPCOES_FORMATO: RadioOption<FormatoFonte>[] = [
  { value: "foto", label: "Foto" },
  { value: "texto", label: "Texto lido" },
];

const NOME_DO_LADO: Record<LadoEmbalagem, string> = {
  front: "Frente",
  back: "Verso",
};

const ROTULO_DO_TEXTO: Record<OrigemCandidato, string> = {
  ocr: "Saída do OCR, sem correção",
  user_submission: "Texto enviado, sem correção",
  import: "Texto importado, sem correção",
};

const LEGENDA_DO_TEXTO: Record<OrigemCandidato, string> = {
  ocr: "Texto exatamente como o OCR devolveu.",
  user_submission: "Texto exatamente como foi enviado.",
  import: "Texto exatamente como veio da importação.",
};

interface TextoComDestaqueProps {
  texto: string;
  trecho: TrechoNoTexto | null;
}

function TextoComDestaque({ texto, trecho }: TextoComDestaqueProps) {
  const marcaRef = useRef<HTMLElement>(null);

  useEffect(() => {
    marcaRef.current?.scrollIntoView({ block: "nearest" });
  }, [trecho]);

  if (trecho === null) {
    return <>{texto}</>;
  }

  return (
    <>
      {texto.slice(0, trecho.start)}
      <mark ref={marcaRef} className={styles.marca}>
        {texto.slice(trecho.start, trecho.end)}
      </mark>
      {texto.slice(trecho.end)}
    </>
  );
}

function PainelFonte({
  fontes,
  origem,
  visao,
  destaque,
  onTrocarVisao,
  onFotoAberta,
}: PainelFonteProps) {
  const [falhas, setFalhas] = useState<Record<LadoEmbalagem, boolean>>({
    front: false,
    back: false,
  });
  const fonte = fontes[visao.lado];
  const falhou = falhas[visao.lado];
  const trecho = destaque !== null && destaque.side === visao.lado ? destaque : null;

  return (
    <section className={styles.painel} aria-labelledby="titulo-fonte">
      <div className={styles.topo}>
        <h3 id="titulo-fonte" className={styles.titulo}>
          Fonte
        </h3>

        <div className={styles.controles}>
          <GrupoRadio
            id="fonte-lado"
            legend="Lado da embalagem"
            legendHidden
            variant="segmentado"
            options={OPCOES_LADO}
            value={visao.lado}
            onChange={(lado) => onTrocarVisao({ ...visao, lado })}
          />

          <GrupoRadio
            id="fonte-formato"
            legend="Formato da fonte"
            legendHidden
            variant="segmentado"
            options={OPCOES_FORMATO}
            value={visao.formato}
            onChange={(formato) => onTrocarVisao({ ...visao, formato })}
          />
        </div>
      </div>

      {visao.formato === "foto" && fonte.photoUrl !== null && !falhou ? (
        <figure className={styles.figura}>
          <img
            key={fonte.photoUrl}
            className={styles.foto}
            src={fonte.photoUrl}
            alt={`${NOME_DO_LADO[visao.lado]} da embalagem, como foi fotografada`}
            onLoad={() => onFotoAberta(visao.lado)}
            onError={() =>
              setFalhas((atual) => ({ ...atual, [visao.lado]: true }))
            }
          />

          <figcaption className={styles.legenda}>
            Foto enviada pelo usuário, sem tratamento.
          </figcaption>
        </figure>
      ) : null}

      {visao.formato === "foto" && fonte.photoUrl !== null && falhou ? (
        <div className={styles.semFoto}>
          <p className={styles.semFotoTitulo}>
            Não foi possível carregar a foto do{" "}
            {NOME_DO_LADO[visao.lado].toLowerCase()} aqui.
          </p>
          <p>
            <a
              href={fonte.photoUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => onFotoAberta(visao.lado)}
            >
              Abrir a foto em outra aba
              <span className="texto-oculto"> (abre em uma nova aba)</span>
            </a>
          </p>
        </div>
      ) : null}

      {visao.formato === "foto" && fonte.photoUrl === null ? (
        <div className={styles.semFoto}>
          <p className={styles.semFotoTitulo}>
            Nenhuma foto do {NOME_DO_LADO[visao.lado].toLowerCase()} foi enviada.
          </p>
          <p>O texto lido pode ser revisado em "Texto lido".</p>
        </div>
      ) : null}

      {visao.formato === "foto" ? null : (
        <figure className={styles.figura}>
          <div className={styles.caixaTexto}>
            <p className={styles.rotuloTexto}>{ROTULO_DO_TEXTO[origem]}</p>

            {fonte.rawText === "" ? (
              <p className={styles.vazio}>Nenhum texto foi lido deste lado.</p>
            ) : (
              <pre
                className={styles.texto}
                aria-label={`Texto do ${NOME_DO_LADO[visao.lado].toLowerCase()}`}
              >
                <TextoComDestaque texto={fonte.rawText} trecho={trecho} />
              </pre>
            )}
          </div>

          <figcaption className={styles.legenda}>
            {LEGENDA_DO_TEXTO[origem]}
          </figcaption>
        </figure>
      )}
    </section>
  );
}

export default PainelFonte;
