import { useState } from "react";
import logo from "../../assets/Logo.svg";
import { AVATARES } from "../../utils/avatarPerfil";
import type { Avatar } from "../../utils/avatarPerfil";
import Button from "../Button";
import Modal from "../Modal";
import styles from "./styles.module.css";

interface ModalFotoPerfilProps {
  open: boolean;
  inicial: string;
  avatar: Avatar;
  onClose: () => void;
  onSave: (avatar: Avatar) => void;
}

function ModalFotoPerfil({
  open,
  inicial,
  avatar,
  onClose,
  onSave,
}: ModalFotoPerfilProps) {
  const [escolhido, setEscolhido] = useState<Avatar>(avatar);

  return (
    <Modal open={open} title="Foto de perfil" onClose={onClose}>
      <fieldset className={styles.grupo}>
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
                checked={escolhido === opcao}
                onChange={() => setEscolhido(opcao)}
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

      <p className={styles.envio}>
        Enviar uma foto do computador ainda não está disponível.
      </p>

      <div className={styles.acoes}>
        <Button
          onClick={() => {
            onSave(escolhido);
            onClose();
          }}
        >
          Salvar
        </Button>

        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
      </div>
    </Modal>
  );
}

export default ModalFotoPerfil;
