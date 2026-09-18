import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import AllergyPicker from "../../components/AllergyPicker";
import BuscaComChips from "../../components/BuscaComChips";
import Button from "../../components/Button";
import ConsentimentoSaude from "../../components/ConsentimentoSaude";
import GrupoCaixas from "../../components/GrupoCaixas";
import GrupoRadio from "../../components/GrupoRadio";
import LayoutSimples from "../../components/LayoutSimples";
import ListaSuspensa from "../../components/ListaSuspensa";
import QuestionCard from "../../components/QuestionCard";
import ResumoErros from "../../components/ResumoErros";
import {
  TOTAL_PERGUNTAS,
  TOTAL_PERGUNTAS_DE_SAUDE,
  useQuestionario,
} from "../../hooks/useQuestionario";
import {
  OPCOES_CABELO,
  OPCOES_CONDICOES,
  OPCOES_COURO,
  OPCOES_FOTOTIPO,
  OPCOES_GENERO,
  OPCOES_IDADE,
  OPCOES_PELE,
  OPCOES_PREFERENCIAS,
  OPCOES_SENSIBILIDADE,
  OPCOES_SITUACAO,
} from "./opcoes";
import styles from "./styles.module.css";

function Perguntas() {
  const {
    respostas,
    responder,
    trocarCondicoes,
    catalogo,
    tentarCatalogoDeNovo,
    formulario,
    itensDoResumo,
    respostasDeSaude,
    resumoRef,
    decisaoRef,
    handleSubmit,
    enviar,
    voltarParaConsentimento,
    salvarProgresso,
  } = useQuestionario();

  return (
    <LayoutSimples>
      <section className={styles.hero} aria-labelledby="titulo-perguntas">
        <p className={styles.eyebrow}>Formulário de perfil · 3 minutos</p>
        <h1 id="titulo-perguntas" className={styles.title}>
          Onze perguntas rápidas.
        </h1>
        <p className={styles.description}>
          Elas fazem cada análise ser sobre a sua pele, e não sobre uma pele
          qualquer. Nada vai para marcas ou anunciantes.
        </p>

        <div className={styles.heroActions}>
          <p className={styles.reassurance}>
            Você pode finalizar este questionário quando quiser.
          </p>
          <Link
            className={styles.later}
            to="/dashboard"
            onClick={salvarProgresso}
          >
            Fazer depois
            <ArrowRight className={styles.laterIcon} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <form className={styles.form} noValidate onSubmit={handleSubmit}>
        <ResumoErros ref={resumoRef} items={itensDoResumo} />

        <QuestionCard number={1} total={TOTAL_PERGUNTAS}>
          <GrupoRadio
            id="genero"
            legend="Qual é o seu gênero?"
            options={OPCOES_GENERO}
            value={respostas.gender}
            onChange={(gender) => responder("gender", gender)}
          />
        </QuestionCard>

        <QuestionCard number={2} total={TOTAL_PERGUNTAS}>
          <GrupoRadio
            id="curvatura-cabelo"
            legend="Qual seu tipo de cabelo?"
            options={OPCOES_CABELO}
            value={respostas.hairCurvature}
            onChange={(curvatura) => responder("hairCurvature", curvatura)}
          />
        </QuestionCard>

        <ConsentimentoSaude
          id="consentimento-saude"
          checked={respostas.healthDataConsent}
          onChange={(autorizado) => responder("healthDataConsent", autorizado)}
        />

        <QuestionCard number={3} total={TOTAL_PERGUNTAS}>
          <GrupoRadio
            id="tipo-pele"
            legend="Qual seu tipo de pele?"
            options={OPCOES_PELE}
            value={respostas.skinType}
            onChange={(skinType) => responder("skinType", skinType)}
          />
        </QuestionCard>

        <QuestionCard number={4} total={TOTAL_PERGUNTAS}>
          <ListaSuspensa
            id="faixa-etaria"
            label="Qual sua faixa etária?"
            placeholder="Selecione a sua faixa etária"
            options={OPCOES_IDADE}
            value={respostas.ageRange}
            onChange={(ageRange) => responder("ageRange", ageRange)}
          />
        </QuestionCard>

        <QuestionCard number={5} total={TOTAL_PERGUNTAS}>
          <GrupoRadio
            id="fototipo"
            legend="Qual o seu fototipo de pele?"
            options={OPCOES_FOTOTIPO}
            value={respostas.skinPhototype}
            onChange={(fototipo) => responder("skinPhototype", fototipo)}
          />
        </QuestionCard>

        <QuestionCard number={6} total={TOTAL_PERGUNTAS}>
          <GrupoRadio
            id="sensibilidade"
            legend="Qual a sensibilidade da sua pele?"
            options={OPCOES_SENSIBILIDADE}
            value={respostas.skinSensitivity}
            onChange={(nivel) => responder("skinSensitivity", nivel)}
          />
        </QuestionCard>

        <QuestionCard number={7} total={TOTAL_PERGUNTAS}>
          <GrupoRadio
            id="couro-cabeludo"
            legend="Como é seu couro cabeludo?"
            options={OPCOES_COURO}
            value={respostas.scalpType}
            onChange={(scalpType) => responder("scalpType", scalpType)}
          />
        </QuestionCard>

        <QuestionCard number={8} total={TOTAL_PERGUNTAS}>
          <GrupoRadio
            id="situacao-atual"
            legend="Alguma destas situações se aplica a você atualmente?"
            options={OPCOES_SITUACAO}
            value={respostas.currentSituation}
            onChange={(situacao) => responder("currentSituation", situacao)}
          />
        </QuestionCard>

        <QuestionCard number={9} total={TOTAL_PERGUNTAS}>
          <GrupoCaixas
            id="condicoes-pele"
            legend="Quais destas características ou condições se aplicam à sua pele atualmente?"
            hint="Selecione todas que se aplicam. Se não souber ou não quiser responder, você pode pular esta pergunta."
            options={OPCOES_CONDICOES}
            value={respostas.skinConditions}
            onChange={trocarCondicoes}
          />
        </QuestionCard>

        <QuestionCard number={10} total={TOTAL_PERGUNTAS}>
          <p className={styles.catalogStatus} aria-live="polite">
            {catalogo.status === "loading" ? "Carregando alergias..." : ""}
          </p>

          {catalogo.status === "error" ? (
            <div className={styles.catalogError} role="alert">
              <p>Não foi possível carregar a lista de alergias.</p>
              <Button variant="secondary" onClick={tentarCatalogoDeNovo}>
                Tentar novamente
              </Button>
            </div>
          ) : null}

          {catalogo.status === "success" ? (
            <AllergyPicker
              id="busca-alergias"
              catalog={catalogo.options}
              value={respostas.allergies}
              onChange={(allergies) => responder("allergies", allergies)}
            />
          ) : null}
        </QuestionCard>

        <QuestionCard number={11} total={TOTAL_PERGUNTAS}>
          <BuscaComChips
            id="busca-preferencias"
            label="Você possui alguma preferência?"
            hint="Pesquise e selecione."
            placeholder="Pesquisar preferência"
            options={OPCOES_PREFERENCIAS}
            selected={respostas.preferences}
            onChange={(preferences) => responder("preferences", preferences)}
            selectedLabel="Preferências selecionadas"
            renderNotFound={(termo) => (
              <p>Nenhuma preferência encontrada para "{termo}".</p>
            )}
          />
        </QuestionCard>

        {formulario.aguardandoDecisao ? (
          <div
            ref={decisaoRef}
            className={styles.decisao}
            tabIndex={-1}
            aria-labelledby="titulo-decisao"
          >
            <h2 id="titulo-decisao" className={styles.decisaoTitulo}>
              Você respondeu {respostasDeSaude} de {TOTAL_PERGUNTAS_DE_SAUDE}{" "}
              perguntas sobre saúde e não autorizou o uso delas.
            </h2>

            <p className={styles.decisaoTexto}>
              Sem a autorização, essas respostas não são salvas, e a análise não
              considera a sua pele.
            </p>

            <div className={styles.decisaoAcoes}>
              <Button type="button" onClick={enviar}>
                Continuar sem essas respostas
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={voltarParaConsentimento}
              >
                Voltar e autorizar
              </Button>
            </div>
          </div>
        ) : null}

        <p className="texto-oculto" aria-live="polite">
          {formulario.situacao === "enviando" ? "Salvando o seu perfil." : ""}
        </p>

        {formulario.situacao === "erro" ? (
          <p role="alert" className={styles.erro}>
            {formulario.mensagem}
          </p>
        ) : null}

        {formulario.situacao === "sucesso" ? (
          <div className={styles.conclusao}>
            <p role="status">Perfil salvo.</p>
            <Button to="/perfil">Ver meu perfil</Button>
          </div>
        ) : (
          <Button
            type="submit"
            className={styles.submit}
            disabled={formulario.situacao === "enviando"}
          >
            {formulario.situacao === "enviando"
              ? "Salvando…"
              : "Concluir questionário"}
          </Button>
        )}
      </form>
    </LayoutSimples>
  );
}

export default Perguntas;
