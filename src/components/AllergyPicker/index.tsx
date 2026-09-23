import BuscaComChips from "../BuscaComChips";
import GrupoRadio from "../GrupoRadio";
import type { RadioOption } from "../GrupoRadio";
import type { SearchOption } from "../BuscaComChips";
import type { PersonalRiskLevel } from "../../types/analise";
import type { AlergiaCatalogo } from "../../types/perfil";
import type { AlergiaSelecionada } from "../../types/questionario";
import styles from "./styles.module.css";

const CONTATO = "venussystem2026@gmail.com";

const OPCOES_GRAVIDADE: RadioOption<PersonalRiskLevel>[] = [
  { value: "low", label: "Baixa" },
  { value: "medium", label: "Média" },
  { value: "high", label: "Alta" },
  { value: "critical", label: "Crítica" },
];

interface AllergyPickerProps {
  id: string;
  catalog: AlergiaCatalogo[];
  value: AlergiaSelecionada[];
  onChange: (alergias: AlergiaSelecionada[]) => void;
  hideLabel?: boolean;
}

function AllergyPicker({
  id,
  catalog,
  value,
  onChange,
  hideLabel = false,
}: AllergyPickerProps) {
  const opcoes: SearchOption<string>[] = catalog.map((alergia) => ({
    id: alergia.id,
    label: alergia.name,
  }));

  function nomeDe(alergiaId: string): string {
    const encontrada = catalog.find((alergia) => alergia.id === alergiaId);

    return encontrada === undefined ? "esta alergia" : encontrada.name;
  }

  function trocarSelecionadas(ids: string[]) {
    onChange(
      ids.map((item) => {
        const atual = value.find((alergia) => alergia.id === item);

        return atual === undefined ? { id: item, severity: "" } : atual;
      }),
    );
  }

  function trocarGravidade(alergiaId: string, severity: PersonalRiskLevel) {
    onChange(
      value.map((alergia) =>
        alergia.id === alergiaId ? { ...alergia, severity } : alergia,
      ),
    );
  }

  return (
    <>
      <BuscaComChips
        id={id}
        label="Você possui alguma alergia?"
        hideLabel={hideLabel}
        hint={hideLabel ? undefined : "Pesquise e selecione."}
        placeholder="Pesquisar alergia"
        options={opcoes}
        selected={value.map((alergia) => alergia.id)}
        onChange={trocarSelecionadas}
        selectedLabel="Alergias selecionadas"
        renderNotFound={(termo) => (
          <p>
            Não encontramos "{termo}" na base da Venus. Se você tem essa
            alergia, escreva para {CONTATO} e nós avaliamos a inclusão.
          </p>
        )}
      />

      {value.length > 0 ? (
        <ul className={styles.severities}>
          {value.map((alergia) => (
            <li className={styles.severity} key={alergia.id}>
              <GrupoRadio
                id={`gravidade-${alergia.id}`}
                legend={`Qual a gravidade de ${nomeDe(alergia.id)}?`}
                options={OPCOES_GRAVIDADE}
                value={alergia.severity}
                onChange={(severity) => trocarGravidade(alergia.id, severity)}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

export default AllergyPicker;
