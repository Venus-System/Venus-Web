import { useRef } from "react";
import type { ChangeEvent, ClipboardEvent, KeyboardEvent } from "react";
import styles from "./styles.module.css";

interface CampoCodigoProps {
  id: string;
  label: string;
  tamanho?: number;
  valor: string;
  onChange: (codigo: string) => void;
  error?: string;
}

function apenasDigitos(texto: string): string {
  return texto.replace(/[^0-9]/g, "");
}

function trocarDigito(codigo: string, posicao: number, digito: string): string {
  const atual = codigo.padEnd(posicao, " ");

  return `${atual.slice(0, posicao)}${digito}${atual.slice(posicao + 1)}`.trimEnd();
}

function CampoCodigo({
  id,
  label,
  tamanho = 6,
  valor,
  onChange,
  error,
}: CampoCodigoProps) {
  const camposRef = useRef<Array<HTMLInputElement | null>>([]);
  const erroId = `${id}-erro`;
  const posicoes = Array.from({ length: tamanho }, (_, indice) => indice);

  function focar(posicao: number) {
    const alvo = camposRef.current[posicao];

    if (alvo) {
      alvo.focus();
      alvo.select();
    }
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>, posicao: number) {
    const digitado = apenasDigitos(event.target.value);

    if (digitado === "") {
      onChange(trocarDigito(valor, posicao, " "));
      return;
    }

    const digito = digitado.slice(-1);

    onChange(trocarDigito(valor, posicao, digito));

    if (posicao + 1 < tamanho) {
      focar(posicao + 1);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>, posicao: number) {
    if (event.key === "Backspace" && valor[posicao] === undefined) {
      event.preventDefault();
      onChange(trocarDigito(valor, posicao - 1, " "));
      focar(posicao - 1);
      return;
    }

    if (event.key === "ArrowLeft" && posicao > 0) {
      event.preventDefault();
      focar(posicao - 1);
    }

    if (event.key === "ArrowRight" && posicao + 1 < tamanho) {
      event.preventDefault();
      focar(posicao + 1);
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();

    const colado = apenasDigitos(event.clipboardData.getData("text")).slice(
      0,
      tamanho,
    );

    if (colado === "") {
      return;
    }

    onChange(colado);
    focar(Math.min(colado.length, tamanho - 1));
  }

  return (
    <div className={styles.bloco}>
      <span className={styles.rotulo} id={`${id}-rotulo`}>
        {label}
      </span>

      <div
        className={styles.caixas}
        role="group"
        aria-labelledby={`${id}-rotulo`}
        aria-describedby={error ? erroId : undefined}
      >
        {posicoes.map((posicao) => (
          <input
            key={posicao}
            id={posicao === 0 ? id : `${id}-${posicao}`}
            ref={(elemento) => {
              camposRef.current[posicao] = elemento;
            }}
            className={error ? styles.caixaInvalida : styles.caixa}
            type="text"
            inputMode="numeric"
            autoComplete={posicao === 0 ? "one-time-code" : "off"}
            maxLength={1}
            value={valor[posicao] ?? ""}
            aria-label={`Dígito ${posicao + 1} de ${tamanho}`}
            aria-invalid={error ? true : undefined}
            onChange={(evento) => handleChange(evento, posicao)}
            onKeyDown={(evento) => handleKeyDown(evento, posicao)}
            onPaste={handlePaste}
          />
        ))}
      </div>

      {error ? (
        <p id={erroId} role="alert" className={styles.erro}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default CampoCodigo;
