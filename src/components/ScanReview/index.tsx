import { useState } from "react";
import type { FormEvent } from "react";
import { AlertTriangle } from "lucide-react";
import type { IngredienteDaLista } from "../../types/escanear";
import {
  montarListaDeIngredientes,
  validarLista,
} from "../../utils/leituraDoRotulo";
import Button from "../Button";
import Input from "../Input";
import styles from "./styles.module.css";

export interface DadosDaRevisao {
  productName: string;
  brand: string;
  ingredientsText: string;
  ingredientes: IngredienteDaLista[];
}

interface ScanReviewProps {
  initialName: string;
  initialBrand: string;
  initialIngredients: string;
  fullText: string;
  sending: boolean;
  errorMessage: string | null;
  onSubmit: (dados: DadosDaRevisao) => void;
  onRestart: () => void;
}

interface ErrosDaRevisao {
  nome: string | null;
  marca: string | null;
  ingredientes: string | null;
}

interface CamposDaRevisao {
  nome: string;
  marca: string;
  texto: string;
  erros: ErrosDaRevisao;
}

const SEM_ERROS: ErrosDaRevisao = { nome: null, marca: null, ingredientes: null };

function ScanReview({
  initialName,
  initialBrand,
  initialIngredients,
  fullText,
  sending,
  errorMessage,
  onSubmit,
  onRestart,
}: ScanReviewProps) {
  const [campos, setCampos] = useState<CamposDaRevisao>({
    nome: initialName,
    marca: initialBrand,
    texto: initialIngredients,
    erros: SEM_ERROS,
  });
  const lista = montarListaDeIngredientes(campos.texto);
  const suspeitos = lista.filter((item) => item.looksLikePackaging).length;

  function handleSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    const erros: ErrosDaRevisao = {
      nome: campos.nome.trim() === "" ? "Informe o nome do produto." : null,
      marca: campos.marca.trim() === "" ? "Informe a marca." : null,
      ingredientes: validarLista(campos.texto, lista),
    };

    if (erros.nome !== null || erros.marca !== null || erros.ingredientes !== null) {
      setCampos((atual) => ({ ...atual, erros }));
      return;
    }

    onSubmit({
      productName: campos.nome.trim(),
      brand: campos.marca.trim(),
      ingredientsText: campos.texto.trim(),
      ingredientes: lista,
    });
  }

  return (
    <form className={styles.revisao} onSubmit={handleSubmit} noValidate>
      <div className={styles.cabecalho}>
        <h2 className={styles.titulo}>Confira antes de enviar</h2>
        <p className={styles.texto}>
          A Venus leu o rótulo. Complete o nome e a marca e corrija o que a
          leitura errou.
        </p>
      </div>

      <Input
        id="nome-do-produto"
        label="Nome do produto"
        value={campos.nome}
        onChange={(evento) =>
          setCampos((atual) => ({
            ...atual,
            nome: evento.target.value,
            erros: { ...atual.erros, nome: null },
          }))
        }
        error={campos.erros.nome ?? undefined}
        autoComplete="off"
        required
      />

      <Input
        id="marca-do-produto"
        label="Marca"
        value={campos.marca}
        onChange={(evento) =>
          setCampos((atual) => ({
            ...atual,
            marca: evento.target.value,
            erros: { ...atual.erros, marca: null },
          }))
        }
        error={campos.erros.marca ?? undefined}
        autoComplete="off"
        required
      />

      <div className={styles.campo}>
        <label className={styles.rotulo} htmlFor="ingredientes-lidos">
          Lista de ingredientes
        </label>

        <p id="ingredientes-lidos-dica" className={styles.texto}>
          Cada vírgula separa um ingrediente. Se a leitura juntou dois nomes,
          ponha a vírgula entre eles.
        </p>

        <textarea
          id="ingredientes-lidos"
          className={
            campos.erros.ingredientes === null ? styles.area : styles.areaInvalida
          }
          rows={8}
          value={campos.texto}
          onChange={(evento) =>
            setCampos((atual) => ({
              ...atual,
              texto: evento.target.value,
              erros: { ...atual.erros, ingredientes: null },
            }))
          }
          aria-describedby={
            campos.erros.ingredientes === null
              ? "ingredientes-lidos-dica"
              : "ingredientes-lidos-dica ingredientes-lidos-erro"
          }
          aria-invalid={campos.erros.ingredientes === null ? undefined : true}
        />

        {campos.erros.ingredientes === null ? null : (
          <p id="ingredientes-lidos-erro" className={styles.erro} role="alert">
            {campos.erros.ingredientes}
          </p>
        )}
      </div>

      <section className={styles.lista} aria-labelledby="titulo-da-lista">
        <h3 id="titulo-da-lista" className={styles.listaTitulo}>
          {lista.length === 1
            ? "1 ingrediente vai ser enviado"
            : `${lista.length} ingredientes vão ser enviados`}
        </h3>

        {suspeitos > 0 ? (
          <p className={styles.texto}>
            {suspeitos === 1
              ? "1 item parece texto da embalagem. Confira e, se não for ingrediente, apague do texto acima."
              : `${suspeitos} itens parecem texto da embalagem. Confira e, se não forem ingredientes, apague do texto acima.`}
          </p>
        ) : null}

        <ol className={styles.itens}>
          {lista.map((item) => (
            <li
              key={item.position}
              className={item.looksLikePackaging ? styles.itemSuspeito : styles.item}
            >
              <span>{item.rawName}</span>

              {item.looksLikePackaging ? (
                <span className={styles.suspeita}>
                  <AlertTriangle className={styles.iconeSuspeita} aria-hidden="true" />
                  parece texto da embalagem
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      <details className={styles.textoCompleto}>
        <summary>Ver todo o texto lido no verso</summary>
        <pre
          className={styles.textoLido}
          tabIndex={0}
          aria-label="Todo o texto lido no verso"
        >
          {fullText}
        </pre>
      </details>

      {errorMessage === null ? null : (
        <p className={styles.erroDoEnvio} role="alert">
          {errorMessage}
        </p>
      )}

      <p className="texto-oculto" aria-live="polite">
        {sending ? "Enviando o produto para análise." : ""}
      </p>

      <div className={styles.acoes}>
        <Button type="submit" disabled={sending}>
          {sending ? "Enviando..." : "Enviar para análise"}
        </Button>

        <Button variant="secondary" onClick={onRestart} disabled={sending}>
          Começar de novo
        </Button>
      </div>
    </form>
  );
}

export default ScanReview;
