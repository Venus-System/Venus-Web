import type { EstadoDaAnalisePessoal } from "../../hooks/useAnalisePessoal";
import type {
  AnalisePersonalizada,
  MotivoDaAnalise,
} from "../../types/analise";
import type { RiskLevel } from "../../types/ingrediente";
import { ROTULO_DA_FAIXA } from "../../utils/niveis";
import { tempoRelativo } from "../../utils/tempoRelativo";
import Button from "../Button";
import RiskBadge from "../RiskBadge";
import styles from "./styles.module.css";

interface PersonalAnalysisProps {
  state: EstadoDaAnalisePessoal;
  firstName: string;
  onRetry: () => void;
  onRecalculate: () => void;
}

interface SeloDoMotivo {
  level: RiskLevel;
  label: string;
}

function seloDoMotivo(motivo: MotivoDaAnalise): SeloDoMotivo {
  if (motivo.source === "allergy") {
    return { level: "avoid", label: "Alergia" };
  }

  return motivo.warning
    ? { level: "warning", label: "Atenção" }
    : { level: "safe", label: "A favor" };
}

function motivosDoPerfil(analise: AnalisePersonalizada): MotivoDaAnalise[] {
  const doPerfil = analise.reasons.filter(
    (motivo) => motivo.source !== "base_score",
  );

  return [
    ...doPerfil.filter((motivo) => motivo.warning),
    ...doPerfil.filter((motivo) => !motivo.warning),
  ];
}

function anuncio(state: EstadoDaAnalisePessoal): string {
  if (state.status === "calculando") {
    return "Calculando a análise para o seu perfil.";
  }

  if (state.status !== "pronta") {
    return "";
  }

  if (state.recalculo === "calculando") {
    return "Recalculando a análise para o seu perfil.";
  }

  return `Análise para o seu perfil pronta: nota ${state.analise.finalScore} de 100, ${ROTULO_DA_FAIXA[state.analise.recommendationLevel]}.`;
}

function PersonalAnalysis({
  state,
  firstName,
  onRetry,
  onRecalculate,
}: PersonalAnalysisProps) {
  if (state.status === "sem-conta" || state.status === "sem-perfil") {
    return null;
  }

  const analise = state.status === "pronta" ? state.analise : null;
  const motivos = analise === null ? [] : motivosDoPerfil(analise);
  const temAlergia = motivos.some((motivo) => motivo.source === "allergy");
  const calculadaEm = analise === null ? "" : tempoRelativo(analise.calculatedAt);

  return (
    <section className={styles.card} aria-labelledby="titulo-para-voce">
      <header className={styles.faixa}>
        <h2 id="titulo-para-voce" className={styles.titulo}>
          {firstName === "" ? "Para você" : `Para você, ${firstName}`}
        </h2>

        <p className={styles.subtitulo}>
          Esta fórmula cruzada com o seu perfil.
        </p>
      </header>

      <div className={styles.corpo}>
        <p className="texto-oculto" aria-live="polite">
          {anuncio(state)}
        </p>

        {state.status === "calculando" ? (
          <p className={styles.texto}>
            Calculando a análise para o seu perfil. Isso leva alguns segundos.
          </p>
        ) : null}

        {state.status === "indisponivel" ? (
          <p className={styles.texto} role="status">
            {state.mensagem}
          </p>
        ) : null}

        {state.status === "erro" ? (
          <>
            <p className={styles.erro} role="alert">
              {state.mensagem}
            </p>

            <Button variant="secondary" onClick={onRetry}>
              Tentar de novo
            </Button>
          </>
        ) : null}

        {state.status === "pronta" ? (
          <>
            {state.analise.summary !== "" ? (
              <p className={styles.resumo}>{state.analise.summary}</p>
            ) : null}

            <ul className={styles.motivos}>
              {motivos.map((motivo) => {
                const selo = seloDoMotivo(motivo);

                return (
                  <li className={styles.motivo} key={motivo.id}>
                    <RiskBadge level={selo.level} label={selo.label} />

                    <p className={styles.texto}>
                      {motivo.ingredientName !== null ? (
                        <strong className={styles.ingrediente}>
                          {motivo.ingredientName}.{" "}
                        </strong>
                      ) : null}
                      {motivo.text}
                    </p>
                  </li>
                );
              })}

              {temAlergia ? null : (
                <li className={styles.motivo}>
                  <RiskBadge level="safe" label="Sem alérgenos seus" />

                  <p className={styles.texto}>
                    Nenhum ingrediente desta fórmula bate com as alergias do seu
                    perfil.
                  </p>
                </li>
              )}
            </ul>

            {state.analise.breakdown.profilePoints === null ? (
              <p className={styles.aviso}>
                Nenhuma resposta do seu perfil entrou nesta conta, então a nota
                é só a qualidade do produto. Um perfil mais completo dá mais o
                que cruzar.
              </p>
            ) : null}

            {state.analise.unevaluatedIngredientCount > 0 ? (
              <p className={styles.aviso}>
                {state.analise.unevaluatedIngredientCount} de{" "}
                {state.analise.ingredientCount} ingredientes estão sem avaliação
                de saúde e ambiental, e ficaram fora dessas duas notas.
              </p>
            ) : null}

            <div className={styles.rodape}>
              {calculadaEm !== "" ? (
                <p className={styles.data}>Calculada {calculadaEm}.</p>
              ) : null}

              <Button
                variant="secondary"
                onClick={onRecalculate}
                disabled={state.recalculo === "calculando"}
              >
                {state.recalculo === "calculando"
                  ? "Recalculando..."
                  : "Recalcular"}
              </Button>

              <Button variant="text" to="/perfil">
                Ver meu perfil
              </Button>
            </div>

            {state.recalculo === "erro" ? (
              <p className={styles.erro} role="alert">
                Não foi possível recalcular. A análise anterior continua
                valendo.
              </p>
            ) : null}
          </>
        ) : null}
      </div>
    </section>
  );
}

export default PersonalAnalysis;
