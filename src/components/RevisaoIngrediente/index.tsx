import GrupoRadio from "../GrupoRadio";
import type { RadioOption } from "../GrupoRadio";
import Input from "../Input";
import type { IngredienteInterpretado } from "../../types/admin";
import styles from "./styles.module.css";

export interface EscolhaDoIngrediente {
  position: number;
  opcao: string;
  inciName: string;
  erro: string | null;
  erroDoNome: string | null;
}

interface RevisaoIngredienteProps {
  ingrediente: IngredienteInterpretado;
  escolha: EscolhaDoIngrediente;
  onMudar: (escolha: EscolhaDoIngrediente) => void;
}

export const OPCAO_CRIAR = "create";
export const OPCAO_DESCARTAR = "discard";

export function idDaDecisao(ingrediente: IngredienteInterpretado): string {
  return `decisao-${ingrediente.id}`;
}

export function idDoNomeInci(ingrediente: IngredienteInterpretado): string {
  return `inci-${ingrediente.id}`;
}

function opcoesDoIngrediente(
  ingrediente: IngredienteInterpretado,
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

  return [{ value: OPCAO_CRIAR, label: "Criar como ingrediente novo" }, descartar];
}

function RevisaoIngrediente({
  ingrediente,
  escolha,
  onMudar,
}: RevisaoIngredienteProps) {
  const estado = ingrediente.status === "ambiguous" ? "ambíguo" : "novo na base";

  return (
    <div className={styles.decisao}>
      <GrupoRadio
        id={idDaDecisao(ingrediente)}
        legend={`${ingrediente.position}. ${ingrediente.rawName} (${estado})`}
        options={opcoesDoIngrediente(ingrediente)}
        value={escolha.opcao}
        onChange={(opcao) => onMudar({ ...escolha, opcao, erro: null })}
        vertical
        error={escolha.erro ?? undefined}
      />

      {escolha.opcao === OPCAO_CRIAR ? (
        <Input
          id={idDoNomeInci(ingrediente)}
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
