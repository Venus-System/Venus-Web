import { useMemo } from "react";
import GrupoRadio from "../GrupoRadio";
import type { RadioOption } from "../GrupoRadio";
import Input from "../Input";
import ListaSuspensa from "../ListaSuspensa";
import type {
  IngredienteInterpretado,
  OpcaoDoCatalogo,
} from "../../types/admin";
import { MAXIMO_DO_NOME_INCI } from "../../utils/validacao";
import styles from "./styles.module.css";

export interface EscolhaDoIngrediente {
  position: number;
  opcao: string;
  inciName: string;
  ingredientId: string;
  erro: string | null;
  erroDoNome: string | null;
  erroDoIngrediente: string | null;
}

interface RevisaoIngredienteProps {
  ingrediente: IngredienteInterpretado;
  escolha: EscolhaDoIngrediente;
  ingredientesDoCatalogo: OpcaoDoCatalogo[] | null;
  onMudar: (escolha: EscolhaDoIngrediente) => void;
}

export const OPCAO_CRIAR = "create";
export const OPCAO_DESCARTAR = "discard";
export const OPCAO_LIGAR = "link-existing";

export function idDaDecisao(ingrediente: IngredienteInterpretado): string {
  return `decisao-${ingrediente.id}`;
}

export function idDoNomeInci(ingrediente: IngredienteInterpretado): string {
  return `inci-${ingrediente.id}`;
}

export function idDoIngredienteCadastrado(
  ingrediente: IngredienteInterpretado,
): string {
  return `cadastrado-${ingrediente.id}`;
}

function opcoesDoIngrediente(
  ingrediente: IngredienteInterpretado,
  podeLigar: boolean,
): RadioOption<string>[] {
  const descartar = { value: OPCAO_DESCARTAR, label: "Descartar da lista" };

  if (ingrediente.status === "ambiguous") {
    return [
      ...ingrediente.candidates.map((candidato) => ({
        value: String(candidato.ingredientId),
        label: `Ligar a ${candidato.inciName}`,
      })),
      descartar,
    ];
  }

  return [
    ...(podeLigar
      ? [{ value: OPCAO_LIGAR, label: "Ligar a um ingrediente já cadastrado" }]
      : []),
    { value: OPCAO_CRIAR, label: "Criar como ingrediente novo" },
    descartar,
  ];
}

function RevisaoIngrediente({
  ingrediente,
  escolha,
  ingredientesDoCatalogo,
  onMudar,
}: RevisaoIngredienteProps) {
  const estado = ingrediente.status === "ambiguous" ? "ambíguo" : "fora da base";
  const podeLigar =
    ingredientesDoCatalogo !== null && ingredientesDoCatalogo.length > 0;

  const listaDoCatalogo = useMemo(() => {
    if (escolha.opcao !== OPCAO_LIGAR || ingredientesDoCatalogo === null) {
      return null;
    }

    return (
      <ListaSuspensa
        id={idDoIngredienteCadastrado(ingrediente)}
        label="Ingrediente cadastrado"
        placeholder="Escolha o ingrediente"
        options={ingredientesDoCatalogo.map((opcao) => ({
          value: String(opcao.id),
          label: opcao.name,
        }))}
        value={escolha.ingredientId}
        onChange={(ingredientId) =>
          onMudar({ ...escolha, ingredientId, erroDoIngrediente: null })
        }
        onClear={() => onMudar({ ...escolha, ingredientId: "" })}
        error={escolha.erroDoIngrediente ?? undefined}
        fullWidth
      />
    );
  }, [ingrediente, escolha, ingredientesDoCatalogo, onMudar]);

  return (
    <div className={styles.decisao}>
      <GrupoRadio
        id={idDaDecisao(ingrediente)}
        legend={`${ingrediente.position}. ${ingrediente.rawName} (${estado})`}
        options={opcoesDoIngrediente(ingrediente, podeLigar)}
        value={escolha.opcao}
        onChange={(opcao) => onMudar({ ...escolha, opcao, erro: null })}
        vertical
        error={escolha.erro ?? undefined}
      />

      {listaDoCatalogo}

      {escolha.opcao === OPCAO_CRIAR ? (
        <Input
          id={idDoNomeInci(ingrediente)}
          maxLength={MAXIMO_DO_NOME_INCI}
          label="Nome INCI do ingrediente novo"
          hint="Confira a grafia. É com este nome que ele entra na base."
          value={escolha.inciName}
          onChange={(evento) =>
            onMudar({
              ...escolha,
              inciName: evento.target.value,
              erroDoNome: null,
            })
          }
          error={escolha.erroDoNome ?? undefined}
        />
      ) : null}
    </div>
  );
}

export default RevisaoIngrediente;
