import { useEffect, useId, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { useLocation } from "react-router-dom";
import {
  CalendarCheck,
  CalendarPlus,
  MessageCirclePlus,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import Button from "../Button";
import ChatAgenda, { ID_DO_CONVITE_DA_AGENDA } from "../ChatAgenda";
import ChatComposer from "../ChatComposer";
import ChatMessage from "../ChatMessage";
import ChatSuggestions from "../ChatSuggestions";
import Veninha from "../Veninha";
import type { EnvioDoChat } from "../../contexts/chat";
import { useAgendaGoogle } from "../../hooks/useAgendaGoogle";
import { useAutenticacao } from "../../hooks/useAutenticacao";
import { useChat } from "../../hooks/useChat";
import { useFalaDaVeninha } from "../../hooks/useFalaDaVeninha";
import { useLinkDaAgenda } from "../../hooks/useLinkDaAgenda";
import { useSegundosRestantes } from "../../hooks/useSegundosRestantes";
import { useTravaDeRolagem } from "../../hooks/useTravaDeRolagem";
import type { ExpressaoDaVeninha, HumorDaVeninha } from "../../types/chat";
import {
  SUGESTOES_DO_PRODUTO,
  SUGESTOES_GERAIS,
  perguntaSobreProduto,
} from "../../utils/chat";
import { guardarSomLigado, lerSomLigado } from "../../utils/somDaVeninha";
import styles from "./styles.module.css";

interface ChatDrawerProps {
  productName?: string;
}

const ID_DO_CAMPO = "chat-mensagem";

const SAUDACAO_GERAL =
  "Oi! Sou a Veninha. Posso explicar os ingredientes e a nota de um produto para você.";

const SAUDACAO_DO_PRODUTO =
  "Oi! Sou a Veninha. Posso explicar os ingredientes e a nota deste produto para você.";

const ID_DA_NOVA_CONVERSA = "chat-nova-conversa";
const ID_DA_CONFIRMACAO = "chat-confirmar-nova-conversa";

function focar(id: string) {
  const elemento = document.getElementById(id);

  if (elemento !== null) {
    elemento.focus();
  }
}

function focarCampo() {
  focar(ID_DO_CAMPO);
}

function humorDoChat(
  envio: EnvioDoChat,
  expressao: ExpressaoDaVeninha,
): HumorDaVeninha {
  if (envio.status === "esperando") {
    return "pensando";
  }

  if (envio.status === "erro" || envio.status === "limite") {
    return "confusa";
  }

  return expressao === "magoada" ? "chorando" : "feliz";
}

function ChatDrawer({ productName }: ChatDrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fimRef = useRef<HTMLDivElement>(null);
  const tituloId = useId();
  const avisoDaNovaId = useId();
  const localizacao = useLocation();
  const { usuario, carregando } = useAutenticacao();
  const {
    aberto,
    mensagens,
    expression,
    envio,
    fechar,
    enviar,
    tentarDeNovo,
    novaConversa,
  } = useChat();
  const [somLigado, setSomLigado] = useState(lerSomLigado);
  const [confirmandoNova, setConfirmandoNova] = useState(false);
  const boca = useFalaDaVeninha(
    mensagens[mensagens.length - 1],
    aberto,
    somLigado,
  );
  const agenda = useAgendaGoogle(usuario === null ? null : usuario.id, aberto);
  const agendaConectada =
    agenda.conexao.status === "pronta" && agenda.conexao.conectada;
  const podeReabrirConvite =
    usuario !== null &&
    agenda.disponivel &&
    agenda.conviteFechado &&
    agenda.conexao.status === "pronta" &&
    !agenda.conexao.conectada;
  const focarConviteRef = useRef(false);
  const linkDaAgenda = useLinkDaAgenda(
    agenda.disponivel &&
      !agenda.conviteFechado &&
      agenda.conexao.status === "pronta" &&
      !agenda.conexao.conectada,
    `${localizacao.pathname}${localizacao.search}`,
    usuario === null ? null : usuario.id,
  );
  const segundos = useSegundosRestantes(
    envio.status === "limite" ? envio.liberaEm : null,
  );
  const semConta = !carregando && usuario === null;
  const bloqueado = envio.status === "esperando" || segundos > 0;

  useTravaDeRolagem(aberto);

  useEffect(() => {
    const dialogo = dialogRef.current;

    if (dialogo === null) {
      return;
    }

    if (aberto && !dialogo.open) {
      dialogo.showModal();
      focarCampo();
    }

    if (!aberto && dialogo.open) {
      dialogo.close();
    }
  }, [aberto]);

  useEffect(() => {
    if (!aberto) {
      setConfirmandoNova(false);
    }
  }, [aberto]);

  useEffect(() => {
    if (confirmandoNova) {
      focar(ID_DA_CONFIRMACAO);
    }
  }, [confirmandoNova]);

  useEffect(() => {
    if (agenda.desconexao.status === "concluida") {
      focarCampo();
    }
  }, [agenda.desconexao.status]);

  useEffect(() => {
    if (focarConviteRef.current && !agenda.conviteFechado) {
      focarConviteRef.current = false;
      focar(ID_DO_CONVITE_DA_AGENDA);
    }
  }, [agenda.conviteFechado]);

  useEffect(() => {
    if (aberto && fimRef.current !== null) {
      fimRef.current.scrollIntoView({ block: "end" });
    }
  }, [aberto, mensagens.length, envio.status]);

  function handleClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current) {
      fechar();
    }
  }

  function repetir() {
    tentarDeNovo();
    focarCampo();
  }

  function perguntarPelaSugestao(texto: string) {
    enviar(perguntaSobreProduto(texto, productName));
  }

  function comecarDeNovo() {
    novaConversa();
    setConfirmandoNova(false);
    focarCampo();
  }

  function cancelarNovaConversa() {
    setConfirmandoNova(false);
    focar(ID_DA_NOVA_CONVERSA);
  }

  function fecharConviteDaAgenda() {
    agenda.fecharConvite();
    focarCampo();
  }

  function reabrirConviteDaAgenda() {
    focarConviteRef.current = true;
    agenda.reabrirConvite();
  }

  function alternarSom() {
    const ligado = !somLigado;

    setSomLigado(ligado);
    guardarSomLigado(ligado);
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={tituloId}
      onClose={fechar}
      onClick={handleClick}
    >
      <div className={styles.veninha}>
        <Veninha
          mood={humorDoChat(envio, expression)}
          speaking={boca.falando}
          mouthOpen={boca.aberta}
        />
      </div>

      <div className={styles.painel}>
        <div className={styles.cabecalho}>
          <h2 id={tituloId} className="texto-oculto">
            Conversa com a Veninha
          </h2>

          {usuario !== null ? (
            <button
              type="button"
              className={styles.acao}
              onClick={alternarSom}
              aria-pressed={somLigado}
              aria-label="Som da Veninha"
            >
              {somLigado ? (
                <Volume2 className={styles.acaoIcone} aria-hidden="true" />
              ) : (
                <VolumeX className={styles.acaoIcone} aria-hidden="true" />
              )}
            </button>
          ) : null}

          {usuario !== null && mensagens.length > 0 ? (
            <button
              id={ID_DA_NOVA_CONVERSA}
              type="button"
              className={styles.acao}
              onClick={() => setConfirmandoNova(true)}
              disabled={envio.status === "esperando"}
              aria-expanded={confirmandoNova}
              aria-label="Nova conversa"
              title="Nova conversa"
            >
              <MessageCirclePlus
                className={styles.acaoIcone}
                aria-hidden="true"
              />
            </button>
          ) : null}

          {podeReabrirConvite ? (
            <button
              type="button"
              className={styles.acao}
              onClick={reabrirConviteDaAgenda}
              aria-label="Conectar a Google Agenda"
              title="Conectar a Google Agenda"
            >
              <CalendarPlus className={styles.acaoIcone} aria-hidden="true" />
            </button>
          ) : null}

          {agenda.disponivel && agendaConectada ? (
            <div className={styles.agenda}>
              <span className={styles.selo}>
                <CalendarCheck className={styles.seloIcone} aria-hidden="true" />
                Agenda conectada
              </span>

              <Button
                variant="text"
                className={styles.desconectar}
                onClick={agenda.desconectar}
                busy={agenda.desconexao.status === "desconectando"}
              >
                Desconectar
              </Button>
            </div>
          ) : null}

          <button
            type="button"
            className={`${styles.acao} ${styles.fechar}`}
            onClick={fechar}
            aria-label="Fechar conversa"
          >
            <X className={styles.acaoIcone} aria-hidden="true" />
          </button>
        </div>

        {aberto ? (
          <>
            <div
              className={styles.rolagem}
              role="region"
              aria-label="Mensagens, sugestões e avisos"
              tabIndex={0}
            >
              <div
                className={styles.mensagens}
                role="log"
                aria-label="Mensagens da conversa"
              >
                <ChatMessage
                  message={{
                    author: "veninha",
                    text:
                      productName === undefined
                        ? SAUDACAO_GERAL
                        : SAUDACAO_DO_PRODUTO,
                  }}
                />

                {mensagens.map((mensagem) => (
                  <ChatMessage key={mensagem.id} message={mensagem} />
                ))}

                {envio.status === "esperando" ? (
                  <p className={styles.pensando}>A Veninha está pensando...</p>
                ) : null}
              </div>

              {usuario !== null && mensagens.length === 0 ? (
                <ChatSuggestions
                  suggestions={
                    productName === undefined
                      ? SUGESTOES_GERAIS
                      : SUGESTOES_DO_PRODUTO
                  }
                  blocked={bloqueado}
                  onPick={perguntarPelaSugestao}
                />
              ) : null}

              {envio.status === "erro" ? (
                <div className={styles.aviso}>
                  <p role="alert">{envio.mensagem}</p>

                  <Button variant="text" onClick={repetir}>
                    Tentar de novo
                  </Button>
                </div>
              ) : null}

              {envio.status === "limite" ? (
                <div className={styles.aviso}>
                  <p role="alert">{envio.mensagem}</p>

                  {segundos > 0 ? (
                    <p>
                      Você pode tentar de novo em {segundos}{" "}
                      {segundos === 1 ? "segundo" : "segundos"}.
                    </p>
                  ) : (
                    <Button variant="text" onClick={repetir}>
                      Tentar de novo
                    </Button>
                  )}
                </div>
              ) : null}

              {confirmandoNova && mensagens.length > 0 ? (
                <div
                  className={styles.confirmacao}
                  role="group"
                  aria-labelledby={avisoDaNovaId}
                >
                  <p id={avisoDaNovaId}>
                    Começar uma conversa nova tira esta da tela, e não dá para
                    voltar a ela. A Veninha começa um assunto novo, mas
                    continua lembrando do que já sabe sobre você.
                  </p>

                  <div className={styles.confirmacaoAcoes}>
                    <Button
                      id={ID_DA_CONFIRMACAO}
                      variant="danger"
                      onClick={comecarDeNovo}
                    >
                      Começar conversa nova
                    </Button>

                    <Button variant="secondary" onClick={cancelarNovaConversa}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : null}

              {usuario !== null && agenda.disponivel ? (
                <ChatAgenda
                  connection={agenda.conexao}
                  disconnection={agenda.desconexao}
                  connectLink={linkDaAgenda.link}
                  onRetryLink={linkDaAgenda.tentarDeNovo}
                  inviteClosed={agenda.conviteFechado}
                  onRetry={agenda.recarregar}
                  onCloseInvite={fecharConviteDaAgenda}
                />
              ) : null}

              <div ref={fimRef} />
            </div>

            {usuario !== null ? (
              <ChatComposer
                id={ID_DO_CAMPO}
                blocked={bloqueado}
                onSend={enviar}
              />
            ) : null}

            {semConta ? (
              <div className={styles.convite}>
                <p>Entre na sua conta para conversar com a Veninha.</p>

                <Button
                  to="/login"
                  state={{ de: localizacao.pathname }}
                  onClick={fechar}
                >
                  Entrar
                </Button>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </dialog>
  );
}

export default ChatDrawer;
