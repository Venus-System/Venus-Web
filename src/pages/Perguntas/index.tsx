import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import GrupoRadio from "../../components/GrupoRadio";
import type { RadioOption } from "../../components/GrupoRadio";
import logo from "../../assets/Logo.svg";
import styles from "./styles.module.css";
import ListaSuspensa from "../../components/ListaSuspensa";
import type { SelectOption } from "../../components/ListaSuspensa";
import type {
  FaixaEtaria,
  Fototipo,
  Genero,
  TipoCouroCabeludo,
  TipoPele,
} from "../../types/perfil";
import type {
  CurvaturaCabelo,
  RespostasQuestionario,
  SensibilidadeQuestionario,
} from "../../types/questionario";
import BuscaComChips from "../../components/BuscaComChips";
import type { SearchOption } from "../../components/BuscaComChips";
import { buscarCatalogoAlergias } from "../../services/catalogoAlergias";
import type { AlergiaOpcao } from "../../services/catalogoAlergias";
import type { PersonalRiskLevel } from "../../types/analise";
import type { PreferenciasPerfil } from "../../types/perfil";

const RESPOSTAS_INICIAIS: RespostasQuestionario = {
  gender: "",
  hairCurvature: "",
  skinType: "",
  ageRange: "",
  skinPhototype: "",
  skinSensitivity: "",
  scalpType: "",
  allergyIds: [],
  healthDataConsent: false,
  allergies: null,
  preferences: null,
};

const OPCOES_GENERO: RadioOption<Genero>[] = [
  { value: "female", label: "Feminino" },
  { value: "male", label: "Masculino" },
  { value: "non_binary", label: "Não binário" },
  { value: "other", label: "Outro" },
  { value: "prefer_not_say", label: "Prefiro não dizer" },
];

const OPCOES_CABELO: RadioOption<CurvaturaCabelo>[] = [
  { value: "1", label: "1" },
  { value: "2a", label: "2a" },
  { value: "2b", label: "2b" },
  { value: "2c", label: "2c" },
  { value: "3a", label: "3a" },
  { value: "3b", label: "3b" },
  { value: "3c", label: "3c" },
  { value: "4a", label: "4a" },
  { value: "4b", label: "4b" },
  { value: "4c", label: "4c" },
];

const OPCOES_PELE: RadioOption<TipoPele>[] = [
  { value: "oily", label: "Oleosa" },
  { value: "combination", label: "Mista" },
  { value: "normal", label: "Normal" },
  { value: "sensitive", label: "Sensível" },
  { value: "dry", label: "Seca" },
];

const OPCOES_IDADE: SelectOption<FaixaEtaria>[] = [
  { value: "age_13_17", label: "13 a 17 anos" },
  { value: "age_18_24", label: "18 a 24 anos" },
  { value: "age_25_34", label: "25 a 34 anos" },
  { value: "age_35_44", label: "35 a 44 anos" },
  { value: "age_45_54", label: "45 a 54 anos" },
  { value: "age_55_plus", label: "55 anos ou mais" },
];

const OPCOES_FOTOTIPO: RadioOption<Fototipo>[] = [
  { value: "I", label: "I" },
  { value: "II", label: "II" },
  { value: "III", label: "III" },
  { value: "IV", label: "IV" },
  { value: "V", label: "V" },
  { value: "VI", label: "VI" },
];

const OPCOES_SENSIBILIDADE: RadioOption<SensibilidadeQuestionario>[] = [
  { value: "low", label: "Baixa" },
  { value: "medium", label: "Média" },
  { value: "high", label: "Alta" },
];

const OPCOES_COURO: RadioOption<TipoCouroCabeludo>[] = [
  { value: "normal", label: "Normal" },
  { value: "dry", label: "Seco" },
  { value: "oily", label: "Oleoso" },
  { value: "dandruff", label: "Com caspa" },
  { value: "sensitive", label: "Sensível" },
  { value: "other", label: "Não sei/Outro" },
];

const OPCOES_GRAVIDADE: RadioOption<PersonalRiskLevel>[] = [
  { value: "low", label: "Baixa" },
  { value: "medium", label: "Média" },
  { value: "high", label: "Alta" },
  { value: "critical", label: "Crítica" },
];

const OPCOES_PREFERENCIAS: SearchOption<keyof PreferenciasPerfil>[] = [
  { id: "preferCrueltyFree", label: "Cruelty-free" },
  { id: "preferVegan", label: "Vegano" },
  { id: "preferSustainable", label: "Sustentável" },
  { id: "preferFragranceFree", label: "Sem fragrância" },
  { id: "preferParabenFree", label: "Sem parabenos" },
  { id: "preferSulfateFree", label: "Sem sulfatos" },
  { id: "preferSiliconeFree", label: "Sem silicones" },
];

type EstadoCatalogo =
  | { status: "loading" }
  | { status: "success"; options: AlergiaOpcao[] }
  | { status: "error" };

function Perguntas() {
  const [respostas, setRespostas] =
    useState<RespostasQuestionario>(RESPOSTAS_INICIAIS);

  const [catalogo, setCatalogo] = useState<EstadoCatalogo>({
    status: "loading",
  });
  const [tentativaCatalogo, setTentativaCatalogo] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let ativo = true;

    buscarCatalogoAlergias(controller.signal)
      .then((options) => {
        if (ativo) {
          setCatalogo({ status: "success", options });
        }
      })
      .catch(() => {
        if (ativo) {
          setCatalogo({ status: "error" });
        }
      });

    return () => {
      ativo = false;
      controller.abort();
    };
  }, [tentativaCatalogo]);

  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#conteudo-perguntas">
        Pular para o conteúdo
      </a>

      <header>
        <Link className={styles.brand} to="/">
          <img className={styles.logo} src={logo} alt="" />
          <span>Venus</span>
        </Link>
      </header>

      <main id="conteudo-perguntas" tabIndex={-1}>
        <section className={styles.hero} aria-labelledby="titulo-perguntas">
          <p className={styles.eyebrow}>Formulário de perfil · 3 minutos</p>
          <h1 id="titulo-perguntas" className={styles.title}>
            Nove perguntas rápidas.
          </h1>
          <p className={styles.description}>
            Elas fazem cada análise ser sobre a sua pele, e não sobre uma pele
            qualquer. Nada vai para marcas ou anunciantes.
          </p>

          <div className={styles.heroActions}>
            <p className={styles.reassurance}>
              Você pode finalizar este questionário quando quiser.
            </p>
            <Link className={styles.later} to="/dashboard">
              Fazer depois
              <ArrowRight className={styles.laterIcon} aria-hidden="true" />
            </Link>
          </div>
        </section>

        <div className={styles.form}>
          <div className={styles.question}>
            <p className={styles.number}>
              <span aria-hidden="true">01/09</span>
              <span className={styles.srOnly}>Pergunta 1 de 9</span>
            </p>
            <GrupoRadio
              id="genero"
              legend="Qual é o seu gênero?"
              options={OPCOES_GENERO}
              value={respostas.gender}
              onChange={(gender) =>
                setRespostas((atual) => ({ ...atual, gender }))
              }
            />
          </div>

          <div className={styles.question}>
            <p className={styles.number}>
              <span aria-hidden="true">02/09</span>
              <span className={styles.srOnly}>Pergunta 2 de 9</span>
            </p>
            <GrupoRadio
              id="curvatura-cabelo"
              legend="Qual seu tipo de cabelo?"
              options={OPCOES_CABELO}
              value={respostas.hairCurvature}
              onChange={(hairCurvature) =>
                setRespostas((atual) => ({ ...atual, hairCurvature }))
              }
            />
          </div>

          <div className={styles.question}>
            <p className={styles.number}>
              <span aria-hidden="true">03/09</span>
              <span className={styles.srOnly}>Pergunta 3 de 9</span>
            </p>
            <GrupoRadio
              id="tipo-pele"
              legend="Qual seu tipo de pele?"
              options={OPCOES_PELE}
              value={respostas.skinType}
              onChange={(skinType) =>
                setRespostas((atual) => ({ ...atual, skinType }))
              }
            />
          </div>

          <div className={styles.question}>
            <p className={styles.number}>
              <span aria-hidden="true">04/09</span>
              <span className={styles.srOnly}>Pergunta 4 de 9</span>
            </p>
            <ListaSuspensa
              id="faixa-etaria"
              label="Qual sua faixa etária?"
              placeholder="Selecione sua faixa etária"
              options={OPCOES_IDADE}
              value={respostas.ageRange}
              onChange={(ageRange) =>
                setRespostas((atual) => ({ ...atual, ageRange }))
              }
            />
          </div>

          <div className={styles.question}>
            <p className={styles.number}>
              <span aria-hidden="true">05/09</span>
              <span className={styles.srOnly}>Pergunta 5 de 9</span>
            </p>
            <GrupoRadio
              id="fototipo"
              legend="Qual o seu fototipo de pele?"
              options={OPCOES_FOTOTIPO}
              value={respostas.skinPhototype}
              onChange={(skinPhototype) =>
                setRespostas((atual) => ({ ...atual, skinPhototype }))
              }
            />
          </div>

          <div className={styles.question}>
            <p className={styles.number}>
              <span aria-hidden="true">06/09</span>
              <span className={styles.srOnly}>Pergunta 6 de 9</span>
            </p>
            <GrupoRadio
              id="sensibilidade"
              legend="Qual a sensibilidade da sua pele?"
              options={OPCOES_SENSIBILIDADE}
              value={respostas.skinSensitivity}
              onChange={(skinSensitivity) =>
                setRespostas((atual) => ({ ...atual, skinSensitivity }))
              }
            />
          </div>

          <div className={styles.question}>
            <p className={styles.number}>
              <span aria-hidden="true">07/09</span>
              <span className={styles.srOnly}>Pergunta 7 de 9</span>
            </p>
            <GrupoRadio
              id="couro-cabeludo"
              legend="Como é seu couro cabeludo?"
              options={OPCOES_COURO}
              value={respostas.scalpType}
              onChange={(scalpType) =>
                setRespostas((atual) => ({ ...atual, scalpType }))
              }
            />
          </div>

          <div className={styles.question}>
            <p className={styles.number}>
              <span aria-hidden="true">08/09</span>
              <span className={styles.srOnly}>Pergunta 8 de 9</span>
            </p>

            <h2 className={styles.questionTitle}>
              Você possui alguma alergia?
            </h2>

            {catalogo.status === "loading" ? (
              <p className={styles.catalogStatus} aria-live="polite">
                Carregando alergias...
              </p>
            ) : null}

            {catalogo.status === "error" ? (
              <div className={styles.catalogError} role="alert">
                <p>Não foi possível carregar as alergias.</p>
                <button
                  type="button"
                  onClick={() => {
                    setCatalogo({ status: "loading" });
                    setTentativaCatalogo((atual) => atual + 1);
                  }}
                >
                  Tentar novamente
                </button>
              </div>
            ) : null}

            {catalogo.status === "success" ? (
              <>
                {catalogo.options.length > 0 ? (
                  <BuscaComChips
                    id="busca-alergias"
                    label="Pesquise suas alergias"
                    hint="Digite o nome e escolha uma opção do catálogo."
                    placeholder="Ex.: lanolina"
                    options={catalogo.options}
                    selected={respostas.allergies?.map((item) => item.id) ?? []}
                    onChange={(ids) =>
                      setRespostas((atual) => ({
                        ...atual,
                        allergies: ids.map(
                          (id) =>
                            atual.allergies?.find((item) => item.id === id) ?? {
                              id,
                              severity: "",
                            },
                        ),
                      }))
                    }
                    selectedLabel="Alergias selecionadas"
                    renderNotFound={(termo) => (
                      <p>Nenhuma alergia encontrada para “{termo}”.</p>
                    )}
                  />
                ) : (
                  <p className={styles.catalogStatus}>
                    O catálogo de alergias está vazio.
                  </p>
                )}

                <div className={styles.noneChoice}>
                  <input
                    id="sem-alergias"
                    className={styles.noneCheckbox}
                    type="checkbox"
                    checked={
                      respostas.allergies !== null &&
                      respostas.allergies.length === 0
                    }
                    onChange={(event) =>
                      setRespostas((atual) => ({
                        ...atual,
                        allergies: event.target.checked ? [] : null,
                      }))
                    }
                  />
                  <label htmlFor="sem-alergias">
                    Não tenho nenhuma alergia
                  </label>
                </div>

                {respostas.allergies && respostas.allergies.length > 0 ? (
                  <div className={styles.severityList}>
                    {respostas.allergies.map((alergia) => {
                      const nome =
                        catalogo.options.find(
                          (opcao) => opcao.id === alergia.id,
                        )?.label ?? "esta alergia";

                      return (
                        <div className={styles.severityItem} key={alergia.id}>
                          <GrupoRadio
                            id={`gravidade-${alergia.id}`}
                            legend={`Qual a gravidade de ${nome}?`}
                            options={OPCOES_GRAVIDADE}
                            value={alergia.severity}
                            onChange={(severity) =>
                              setRespostas((atual) => ({
                                ...atual,
                                allergies:
                                  atual.allergies?.map((item) =>
                                    item.id === alergia.id
                                      ? { ...item, severity }
                                      : item,
                                  ) ?? null,
                              }))
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </>
            ) : null}
          </div>

          <div className={styles.question}>
            <p className={styles.number}>
              <span aria-hidden="true">09/09</span>
              <span className={styles.srOnly}>Pergunta 9 de 9</span>
            </p>

            <h2 className={styles.questionTitle}>
              Quais são suas preferências?
            </h2>

            <BuscaComChips
              id="busca-preferencias"
              label="Pesquise suas preferências"
              hint="Você pode escolher mais de uma opção."
              placeholder="Ex.: vegano"
              options={OPCOES_PREFERENCIAS}
              selected={respostas.preferences ?? []}
              onChange={(preferences) =>
                setRespostas((atual) => ({
                  ...atual,
                  preferences,
                }))
              }
              selectedLabel="Preferências selecionadas"
              renderNotFound={(termo) => (
                <p>Nenhuma preferência encontrada para “{termo}”.</p>
              )}
            />

            <div className={styles.noneChoice}>
              <input
                id="sem-preferencias"
                className={styles.noneCheckbox}
                type="checkbox"
                checked={
                  respostas.preferences !== null &&
                  respostas.preferences.length === 0
                }
                onChange={(event) =>
                  setRespostas((atual) => ({
                    ...atual,
                    preferences: event.target.checked ? [] : null,
                  }))
                }
              />
              <label htmlFor="sem-preferencias">
                Não tenho nenhuma preferência
              </label>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Perguntas;
