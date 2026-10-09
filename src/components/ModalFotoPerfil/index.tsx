import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, ClipboardEvent, DragEvent } from "react";
import { Focus } from "lucide-react";
import logo from "../../assets/Logo.svg";
import { AVATARES } from "../../utils/avatarPerfil";
import type { Avatar } from "../../utils/avatarPerfil";
import {
  TAMANHO_MAXIMO_EM_MB,
  TIPOS_DE_IMAGEM,
  validarFoto,
} from "../../services/avatar";
import Button from "../Button";
import Modal from "../Modal";
import styles from "./styles.module.css";

export type EscolhaDeFoto =
  | { tipo: "avatar"; avatar: Avatar }
  | { tipo: "arquivo"; arquivo: File };

export type SituacaoDaFoto = "ocioso" | "enviando" | "erro";

interface ModalFotoPerfilProps {
  open: boolean;
  inicial: string;
  avatar: Avatar;
  situacao: SituacaoDaFoto;
  mensagemDeErro: string;
  onClose: () => void;
  onSave: (escolha: EscolhaDeFoto) => void;
}

interface EstadoDoArquivo {
  arquivo: File | null;
  previa: string;
  erro: string;
}

const SEM_ARQUIVO: EstadoDoArquivo = { arquivo: null, previa: "", erro: "" };

function semExtensao(nome: string): string {
  const ponto = nome.lastIndexOf(".");

  return ponto <= 0 ? nome : nome.slice(0, ponto);
}

function ModalFotoPerfil({
  open,
  inicial,
  avatar,
  situacao,
  mensagemDeErro,
  onClose,
  onSave,
}: ModalFotoPerfilProps) {
  const [escolhido, setEscolhido] = useState<Avatar>(avatar);
  const [imagem, setImagem] = useState<EstadoDoArquivo>(SEM_ARQUIVO);
  const [arrastando, setArrastando] = useState(false);
  const campoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (imagem.previa === "") {
      return;
    }

    return () => URL.revokeObjectURL(imagem.previa);
  }, [imagem.previa]);

  function receber(arquivo: File | undefined) {
    if (arquivo === undefined) {
      return;
    }

    const erro = validarFoto(arquivo);

    if (erro !== null) {
      setImagem({ ...SEM_ARQUIVO, erro });
      return;
    }

    setImagem({ arquivo, previa: URL.createObjectURL(arquivo), erro: "" });
  }

  function handleArquivo(evento: ChangeEvent<HTMLInputElement>) {
    receber(evento.target.files?.[0]);
  }

  function handleSoltar(evento: DragEvent<HTMLDivElement>) {
    evento.preventDefault();
    setArrastando(false);
    receber(evento.dataTransfer.files[0]);
  }

  function handleColar(evento: ClipboardEvent<HTMLDivElement>) {
    receber(evento.clipboardData.files[0]);
  }

  function handleSalvar() {
    if (imagem.arquivo !== null) {
      onSave({ tipo: "arquivo", arquivo: imagem.arquivo });
      return;
    }

    onSave({ tipo: "avatar", avatar: escolhido });
  }

  const enviando = situacao === "enviando";

  return (
    <Modal open={open} title="Foto de perfil" onClose={onClose}>
      <fieldset className={styles.grupo} disabled={enviando}>
        <legend className={styles.legenda}>Avatares do Venus</legend>

        <div className={styles.opcoes}>
          {AVATARES.map((opcao, posicao) => (
            <label
              key={opcao}
              className={`${styles.opcao} ${styles[opcao]}`}
              htmlFor={posicao === 0 ? "avatar" : `avatar-${opcao}`}
            >
              <input
                id={posicao === 0 ? "avatar" : `avatar-${opcao}`}
                type="radio"
                name="avatar"
                className="texto-oculto"
                checked={imagem.arquivo === null && escolhido === opcao}
                onChange={() => {
                  setEscolhido(opcao);
                  setImagem(SEM_ARQUIVO);
                }}
              />

              {opcao === "marca" ? (
                <img className={styles.logo} src={logo} alt="" />
              ) : (
                <span aria-hidden="true">{inicial}</span>
              )}

              <span className="texto-oculto">Avatar {posicao + 1}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <p className={styles.separador}>
        <span>ou</span>
      </p>

      <div
        className={`${styles.area} ${arrastando ? styles.areaAtiva : ""}`}
        onDragOver={(evento) => {
          evento.preventDefault();
          setArrastando(true);
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={handleSoltar}
        onPaste={handleColar}
      >
        {imagem.previa === "" ? (
          <span className={styles.alvo} aria-hidden="true">
            <Focus className={styles.alvoIcone} />
          </span>
        ) : (
          <img className={styles.previa} src={imagem.previa} alt="" />
        )}

        <button
          type="button"
          className={styles.escolher}
          onClick={() => campoRef.current?.click()}
          disabled={enviando}
        >
          {imagem.arquivo === null
            ? "Escolher uma foto no computador"
            : `Trocar ${semExtensao(imagem.arquivo.name)}`}
        </button>

        <p className={styles.dica}>
          Cole com <kbd>Ctrl</kbd> + <kbd>V</kbd>, arraste o arquivo, ou clique
          para escolher no computador. PNG, JPEG ou WebP, até{" "}
          {TAMANHO_MAXIMO_EM_MB} MB. Fotos que não forem quadradas são
          recortadas no centro, como na prévia.
        </p>

        <input
          ref={campoRef}
          id="foto-do-computador"
          type="file"
          className="texto-oculto"
          accept={TIPOS_DE_IMAGEM.join(",")}
          onChange={handleArquivo}
        />
      </div>

      {imagem.erro === "" ? null : (
        <p className={styles.erro} role="alert">
          {imagem.erro}
        </p>
      )}

      {situacao === "erro" ? (
        <p className={styles.erro} role="alert">
          {mensagemDeErro}
        </p>
      ) : null}

      <p className="texto-oculto" aria-live="polite">
        {enviando ? "Enviando a sua foto." : ""}
      </p>

      <div className={styles.acoes}>
        <Button onClick={handleSalvar} disabled={enviando}>
          {enviando ? "Enviando…" : "Salvar"}
        </Button>

        <Button variant="secondary" onClick={onClose} disabled={enviando}>
          Cancelar
        </Button>
      </div>
    </Modal>
  );
}

export default ModalFotoPerfil;
