import { Plus, Search } from "lucide-react";
import { useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent, ReactNode } from "react";
import Chip from "../Chip";
import Input from "../Input";
import styles from "./styles.module.css";

const LIMITE_RESULTADOS = 6;

export interface SearchOption<T extends string> {
  id: T;
  label: string;
}

interface BuscaComChipsProps<T extends string> {
  id: string;
  label: string;
  hideLabel?: boolean;
  hint?: string;
  placeholder?: string;
  options: SearchOption<T>[];
  selected: T[];
  onChange: (selecionados: T[]) => void;
  selectedLabel: string;
  renderNotFound: (termo: string) => ReactNode;
  error?: string;
}

interface EstadoBusca {
  termo: string;
  anuncio: string;
}

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .trim()
    .toLowerCase();
}

function descreverResultados(
  termo: string,
  encontrados: number,
  disponiveis: number,
): string {
  if (termo === "") {
    return "";
  }

  if (encontrados === 0) {
    return `Nenhum resultado para "${termo}".`;
  }

  if (disponiveis === 0) {
    return `Todos os resultados para "${termo}" já foram adicionados.`;
  }

  if (disponiveis > LIMITE_RESULTADOS) {
    return `Mostrando ${LIMITE_RESULTADOS} de ${disponiveis} resultados. Continue digitando para refinar.`;
  }

  return disponiveis === 1 ? "1 resultado." : `${disponiveis} resultados.`;
}

function BuscaComChips<T extends string>({
  id,
  label,
  hideLabel = false,
  hint,
  placeholder,
  options,
  selected,
  onChange,
  selectedLabel,
  renderNotFound,
  error,
}: BuscaComChipsProps<T>) {
  const [busca, setBusca] = useState<EstadoBusca>({ termo: "", anuncio: "" });
  const campoRef = useRef<HTMLInputElement>(null);

  const termo = busca.termo.trim();
  const termoNormalizado = normalizar(termo);

  const encontrados =
    termoNormalizado === ""
      ? []
      : options.filter((option) =>
          normalizar(option.label).includes(termoNormalizado),
        );

  const disponiveis = encontrados.filter(
    (option) => !selected.includes(option.id),
  );

  const escolhidas = options.filter((option) => selected.includes(option.id));

  const status =
    busca.anuncio !== ""
      ? busca.anuncio
      : descreverResultados(termo, encontrados.length, disponiveis.length);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setBusca({ termo: event.target.value, anuncio: "" });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  }

  function adicionar(option: SearchOption<T>) {
    onChange([...selected, option.id]);
    setBusca({ termo: "", anuncio: `Adicionado: ${option.label}.` });
    campoRef.current?.focus();
  }

  function remover(option: SearchOption<T>) {
    onChange(selected.filter((escolhido) => escolhido !== option.id));
    setBusca((atual) => ({ ...atual, anuncio: `Removido: ${option.label}.` }));
    campoRef.current?.focus();
  }

  return (
    <div className={styles.wrapper}>
      <Input
        ref={campoRef}
        id={id}
        label={label}
        hideLabel={hideLabel}
        labelVariant="title"
        hint={hint}
        placeholder={placeholder}
        icon={<Search />}
        autoComplete="off"
        value={busca.termo}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        error={error}
      />

      <p className="texto-oculto" aria-live="polite">
        {status}
      </p>

      {termoNormalizado !== "" && encontrados.length === 0 ? (
        <div className={styles.message}>{renderNotFound(termo)}</div>
      ) : null}

      {encontrados.length > 0 && disponiveis.length === 0 ? (
        <p className={styles.message}>
          Todos os resultados para "{termo}" já foram adicionados.
        </p>
      ) : null}

      {disponiveis.length > 0 ? (
        <ul className={styles.results} aria-label={`Resultados para ${termo}`}>
          {disponiveis.slice(0, LIMITE_RESULTADOS).map((option) => (
            <li key={option.id}>
              <button
                type="button"
                className={styles.result}
                onClick={() => adicionar(option)}
                aria-label={`Adicionar ${option.label}`}
              >
                <Plus className={styles.resultIcon} aria-hidden="true" />
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {escolhidas.length > 0 ? (
        <ul className={styles.chips} aria-label={selectedLabel}>
          {escolhidas.map((option) => (
            <li key={option.id}>
              <Chip label={option.label} onRemove={() => remover(option)} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default BuscaComChips;
