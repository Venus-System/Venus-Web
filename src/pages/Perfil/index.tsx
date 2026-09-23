import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, RotateCcw } from "lucide-react";
import AllergyPicker from "../../components/AllergyPicker";
import BuscaComChips from "../../components/BuscaComChips";
import Button from "../../components/Button";
import Interruptor from "../../components/Interruptor";
import GrupoCaixas from "../../components/GrupoCaixas";
import GrupoRadio from "../../components/GrupoRadio";
import Input from "../../components/Input";
import ListaSuspensa from "../../components/ListaSuspensa";
import MainLayout from "../../components/MainLayout";
import Modal from "../../components/Modal";
import ModalFotoPerfil from "../../components/ModalFotoPerfil";
import ResumoErros from "../../components/ResumoErros";
import { useAutenticacao } from "../../hooks/useAutenticacao";
import { usePerfil } from "../../hooks/usePerfil";
import { guardarAvatar, lerAvatar } from "../../utils/avatarPerfil";
import type { Avatar } from "../../utils/avatarPerfil";
import type { StatusConta } from "../../types/usuario";
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
} from "../Perguntas/opcoes";
import styles from "./styles.module.css";

const SECOES = [
  { id: "titulo-conta", rotulo: "Conta" },
  { id: "titulo-pele", rotulo: "Pele & cabelo" },
  { id: "titulo-alergias", rotulo: "Saúde & alergias" },
  { id: "titulo-valores", rotulo: "Valores" },
  { id: "titulo-privacidade", rotulo: "Privacidade" },
];

const ROTULO_STATUS: Record<StatusConta, string> = {
  active: "Perfil ativo",
  pending: "Cadastro pendente",
  inactive: "Perfil inativo",
  blocked: "Perfil bloqueado",
};

const INDISPONIVEIS = [
  { id: "usar-historico", label: "Usar meu histórico para recomendações" },
  {
    id: "mostrar-avaliacoes",
    label: "Mostrar minhas avaliações na comunidade",
  },
  { id: "resumo-semanal", label: "Receber resumo semanal por e-mail" },
];

interface EstadoDaConta {
  nome: string;
  situacao: "ocioso" | "salvando" | "salvo" | "erro";
  mensagem: string;
}

function Perfil() {
  const navegar = useNavigate();
  const { usuario, sair, atualizarNome } = useAutenticacao();
  const [conta, setConta] = useState<EstadoDaConta>({
    nome: "",
    situacao: "ocioso",
    mensagem: "",
  });
  const [revogando, setRevogando] = useState(false);
  const [trocandoFoto, setTrocandoFoto] = useState(false);
  const [avatar, setAvatar] = useState<Avatar>(() => lerAvatar());
  const {
    carregamento,
    catalogo,
    respostas,
    statusDaConta,
    responder,
    envio,
    itensDoResumo,
    respostasPreenchidas,
    totalDeRespostas,
    foto,
    enviarFoto,
    resumoRef,
    trocarCondicoes,
    revogarConsentimento,
    handleSubmit,
  } = usePerfil();

  const nome = usuario === null ? "" : usuario.name;
  const email = usuario === null ? "" : usuario.email;

  useEffect(() => {
    setConta({ nome, situacao: "ocioso", mensagem: "" });
  }, [nome]);

  async function salvarNome() {
    if (conta.nome.trim() === nome) {
      return;
    }

    setConta((atual) => ({ ...atual, situacao: "salvando", mensagem: "" }));

    try {
      await atualizarNome(conta.nome);

      setConta((atual) => ({ ...atual, situacao: "salvo", mensagem: "" }));
    } catch (erro) {
      setConta((atual) => ({
        ...atual,
        situacao: "erro",
        mensagem:
          erro instanceof Error
            ? erro.message
            : "Não foi possível salvar o seu nome.",
      }));
    }
  }

  function handleSair() {
    void sair().then(() => navegar("/login"));
  }
  const progresso = Math.round((respostasPreenchidas / totalDeRespostas) * 100);

  return (
    <MainLayout>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            Meu <span className={styles.titleAccent}>perfil.</span>
          </h1>

          <p className={styles.subtitle}>
            É o perfil que gera seus alertas. Quanto mais completo, mais precisa
            fica cada análise.
          </p>
        </header>

        <div className={styles.columns}>
          <aside className={styles.aside}>
            <button
              type="button"
              className={`${styles.avatar} ${styles[avatar]}`}
              onClick={() => setTrocandoFoto(true)}
            >
              {foto.url === null ? (
                <span aria-hidden="true">{nome.charAt(0)}</span>
              ) : (
                <img className={styles.avatarFoto} src={foto.url} alt="" />
              )}

              <span className="texto-oculto">Trocar a foto de perfil</span>
            </button>

            <p className={styles.name}>{nome}</p>
            <p className={styles.email}>{email}</p>

            {statusDaConta === null ? null : (
              <p className={`${styles.selo} ${styles[statusDaConta]}`}>
                {ROTULO_STATUS[statusDaConta]}
              </p>
            )}

            {carregamento.status === "pronto" ? (
              <div className={styles.progresso}>
                <div className={styles.progressoTopo}>
                  <span>Perfil completo</span>
                  <span className={styles.progressoValor}>{progresso}%</span>
                </div>

                <div
                  className={styles.barra}
                  role="progressbar"
                  aria-valuenow={progresso}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Perfil completo"
                >
                  <div
                    className={styles.barraPreenchida}
                    style={{ width: `${progresso}%` }}
                  />
                </div>
              </div>
            ) : null}

            {carregamento.status === "pronto" ? (
              <nav className={styles.indice} aria-label="Seções do perfil">
                <ul className={styles.indiceLista}>
                  {SECOES.map((secao) => (
                    <li key={secao.id}>
                      <a className={styles.indiceLink} href={`#${secao.id}`}>
                        {secao.rotulo}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}

            <Button variant="violet" className={styles.refazer} to="/perguntas">
              <RotateCcw className={styles.refazerIcone} aria-hidden="true" />
              Refazer questionário
            </Button>
          </aside>

          <div className={styles.conteudo}>
            {carregamento.status === "carregando" ? (
              <p className={styles.estado} aria-live="polite">
                Carregando o seu perfil...
              </p>
            ) : null}

            {carregamento.status === "erro" ? (
              <p className={styles.estadoErro} role="alert">
                {carregamento.mensagem}
              </p>
            ) : null}

            {carregamento.status === "vazio" ? (
              <section className={styles.convite}>
                <h2 className={styles.conviteTitulo}>
                  Você ainda não respondeu o questionário
                </h2>

                <p className={styles.conviteTexto}>
                  São onze perguntas rápidas. Sem elas, a Venus mostra a
                  avaliação geral dos produtos, mas não consegue dizer o que
                  cada fórmula faz com a sua pele.
                </p>

                <Link className={styles.conviteLink} to="/perguntas">
                  Responder agora
                </Link>
              </section>
            ) : null}

            {respostas === null ? null : (
              <form
                className={styles.form}
                noValidate
                onSubmit={(evento) => {
                  void salvarNome();
                  handleSubmit(evento);
                }}
              >
                <ResumoErros ref={resumoRef} items={itensDoResumo} />

                <section className={styles.card} aria-labelledby="titulo-conta">
                  <h2
                    id="titulo-conta"
                    className={styles.cardTitulo}
                    tabIndex={-1}
                  >
                    Conta
                  </h2>
                  <p className={styles.cardTexto}>Seus dados básicos.</p>

                  <div className={styles.grade}>
                    <Input
                      id="perfil-nome"
                      label="Nome"
                      value={conta.nome}
                      onChange={(evento) =>
                        setConta({
                          nome: evento.target.value,
                          situacao: "ocioso",
                          mensagem: "",
                        })
                      }
                      error={
                        conta.situacao === "erro" ? conta.mensagem : undefined
                      }
                    />

                    <Input
                      id="perfil-email"
                      label="E-mail"
                      type="email"
                      value={email}
                      disabled
                      hint="Para trocar o e-mail, escreva para venussystem2026@gmail.com."
                    />

                    <ListaSuspensa
                      id="faixa-etaria"
                      label="Faixa etária"
                      placeholder="Selecione a sua faixa etária"
                      options={OPCOES_IDADE}
                      value={respostas.ageRange}
                      onChange={(ageRange) => responder("ageRange", ageRange)}
                      error={envio.erros.ageRange ?? undefined}
                    />

                    <ListaSuspensa
                      id="genero"
                      label="Gênero"
                      placeholder="Selecione o seu gênero"
                      options={OPCOES_GENERO}
                      value={respostas.gender}
                      onChange={(gender) => responder("gender", gender)}
                    />
                  </div>

                </section>

                <section className={styles.card} aria-labelledby="titulo-pele">
                  <h2
                    id="titulo-pele"
                    className={styles.cardTitulo}
                    tabIndex={-1}
                  >
                    Pele &amp; cabelo
                  </h2>
                  <p className={styles.cardTexto}>
                    A base de toda análise personalizada.
                  </p>

                  <GrupoRadio
                    id="tipo-pele"
                    legend="Tipo de pele"
                    options={OPCOES_PELE}
                    value={respostas.skinType}
                    onChange={(skinType) => responder("skinType", skinType)}
                    variant="pilula"
                  />

                  <GrupoRadio
                    id="fototipo"
                    legend="Fototipo de pele"
                    options={OPCOES_FOTOTIPO}
                    value={respostas.skinPhototype}
                    onChange={(fototipo) =>
                      responder("skinPhototype", fototipo)
                    }
                    variant="pilula"
                  />

                  <GrupoRadio
                    id="sensibilidade"
                    legend="Sensibilidade da pele"
                    options={OPCOES_SENSIBILIDADE}
                    value={respostas.skinSensitivity}
                    onChange={(nivel) => responder("skinSensitivity", nivel)}
                    variant="pilula"
                  />

                  <GrupoRadio
                    id="curvatura-cabelo"
                    legend="Tipo de cabelo"
                    options={OPCOES_CABELO}
                    value={respostas.hairCurvature}
                    onChange={(curvatura) =>
                      responder("hairCurvature", curvatura)
                    }
                    variant="pilula"
                  />

                  <GrupoRadio
                    id="couro-cabeludo"
                    legend="Couro cabeludo"
                    options={OPCOES_COURO}
                    value={respostas.scalpType}
                    onChange={(scalpType) => responder("scalpType", scalpType)}
                    variant="pilula"
                  />

                  <GrupoRadio
                    id="situacao-atual"
                    legend="Situação atual"
                    options={OPCOES_SITUACAO}
                    value={respostas.currentSituation}
                    onChange={(situacao) =>
                      responder("currentSituation", situacao)
                    }
                    variant="pilula"
                  />

                  <GrupoCaixas
                    id="condicoes-pele"
                    legend="Condições de pele"
                    options={OPCOES_CONDICOES}
                    value={respostas.skinConditions}
                    onChange={trocarCondicoes}
                    variant="pilula"
                  />
                </section>

                <section
                  className={styles.card}
                  aria-labelledby="titulo-alergias"
                >
                  <h2
                    id="titulo-alergias"
                    className={styles.cardTitulo}
                    tabIndex={-1}
                  >
                    Alergias
                  </h2>
                  <p className={styles.cardTexto}>Pelo bem da sua segurança.</p>

                  <p className={styles.estado} aria-live="polite">
                    {catalogo.status === "carregando"
                      ? "Carregando alergias..."
                      : ""}
                  </p>

                  {catalogo.status === "erro" ? (
                    <p className={styles.estadoErro} role="alert">
                      Não foi possível carregar a lista de alergias.
                    </p>
                  ) : null}

                  {catalogo.status === "pronto" ? (
                    <AllergyPicker
                      id="busca-alergias"
                      hideLabel
                      catalog={catalogo.alergias}
                      value={respostas.allergies}
                      onChange={(allergies) =>
                        responder("allergies", allergies)
                      }
                    />
                  ) : null}
                </section>

                <section
                  className={styles.card}
                  aria-labelledby="titulo-valores"
                >
                  <h2
                    id="titulo-valores"
                    className={styles.cardTitulo}
                    tabIndex={-1}
                  >
                    Valores
                  </h2>
                  <p className={styles.cardTexto}>
                    O que você não abre mão nas suas escolhas.
                  </p>

                  <BuscaComChips
                    id="busca-preferencias"
                    label="Você possui alguma preferência?"
                    hideLabel
                    placeholder="Pesquisar preferência"
                    options={OPCOES_PREFERENCIAS}
                    selected={respostas.preferences}
                    onChange={(preferences) =>
                      responder("preferences", preferences)
                    }
                    selectedLabel="Preferências selecionadas"
                    renderNotFound={(termo) => (
                      <p>Nenhuma preferência encontrada para "{termo}".</p>
                    )}
                  />
                </section>

                <section
                  className={styles.card}
                  aria-labelledby="titulo-privacidade"
                >
                  <h2
                    id="titulo-privacidade"
                    className={styles.cardTitulo}
                    tabIndex={-1}
                  >
                    Privacidade
                  </h2>
                  <p className={styles.cardTexto}>Seus dados, suas regras.</p>

                  <Interruptor
                    id="consentimento-saude"
                    label="Usar minhas respostas de saúde na análise"
                    checked={respostas.healthDataConsent}
                    onChange={(autorizado) => {
                      if (autorizado) {
                        responder("healthDataConsent", true);
                        return;
                      }

                      setRevogando(true);
                    }}
                    hint="Desligar apaga as suas respostas sobre pele e saúde."
                  />

                  {INDISPONIVEIS.map((opcao) => (
                    <Interruptor
                      key={opcao.id}
                      id={opcao.id}
                      label={opcao.label}
                      checked={false}
                      onChange={() => undefined}
                      indisponivel
                      hint="Ainda não disponível."
                    />
                  ))}
                </section>

                <p className="texto-oculto" aria-live="polite">
                  {envio.situacao === "enviando"
                    ? "Salvando o seu perfil."
                    : ""}
                </p>

                {envio.situacao === "erro" ? (
                  <p className={styles.estadoErro} role="alert">
                    {envio.mensagem}
                  </p>
                ) : null}

                {envio.situacao === "sucesso" ? (
                  <p className={styles.sucesso} role="status">
                    Perfil salvo.
                  </p>
                ) : null}

                <Button
                  type="submit"
                  className={styles.submit}
                  disabled={envio.situacao === "enviando"}
                >
                  {envio.situacao === "enviando"
                    ? "Salvando…"
                    : "Salvar alterações"}
                </Button>
              </form>
            )}

            <section className={styles.cardRisco} aria-labelledby="titulo-fim">
              <h2 id="titulo-fim" className={styles.cardTitulo}>
                Sair e apagar
              </h2>

              <p className={styles.cardTexto}>
                Sair encerra a sessão neste navegador. Seus dados continuam
                salvos e você volta quando quiser.
              </p>

              <button type="button" className={styles.sair} onClick={handleSair}>
                <LogOut className={styles.sairIcone} aria-hidden="true" />
                Sair da conta
              </button>

              <p className={styles.cardTexto}>
                Apaga o seu perfil, as alergias, as preferências e o histórico.
                A exclusão é imediata e não tem volta.
              </p>

              <button
                type="button"
                className={styles.apagar}
                aria-disabled="true"
                aria-describedby="aviso-apagar"
              >
                Apagar minha conta
              </button>

              <p id="aviso-apagar" className={styles.cardTexto}>
                Ainda não dá para apagar a conta por aqui. Escreva para
                venussystem2026@gmail.com e nós apagamos.
              </p>
            </section>
          </div>
        </div>
      </div>

      <Modal
        open={revogando}
        title="Revogar o consentimento?"
        onClose={() => setRevogando(false)}
      >
        <p className={styles.cardTexto}>
          Isso apaga agora as suas respostas de tipo de pele, fototipo,
          sensibilidade, couro cabeludo, situação atual, condições de pele e
          alergias. Para tê-las de volta, você precisaria responder de novo.
        </p>

        <div className={styles.modalAcoes}>
          <Button
            onClick={() => {
              setRevogando(false);
              revogarConsentimento();
            }}
          >
            Revogar e apagar
          </Button>

          <Button variant="secondary" onClick={() => setRevogando(false)}>
            Cancelar
          </Button>
        </div>
      </Modal>

      <ModalFotoPerfil
        open={trocandoFoto}
        inicial={nome.charAt(0)}
        avatar={avatar}
        situacao={foto.situacao}
        mensagemDeErro={foto.mensagem}
        onClose={() => setTrocandoFoto(false)}
        onSave={(escolha) => {
          if (escolha.tipo === "arquivo") {
            void enviarFoto(escolha.arquivo).then((salvou) => {
              if (salvou) {
                setTrocandoFoto(false);
              }
            });

            return;
          }

          setAvatar(escolha.avatar);
          guardarAvatar(escolha.avatar);
          setTrocandoFoto(false);
        }}
      />
    </MainLayout>
  );
}

export default Perfil;
