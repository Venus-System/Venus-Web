import Button from "../Button";
import Modal from "../Modal";
import styles from "./styles.module.css";

export interface IngredienteACriar {
  position: number;
  inciName: string;
}

interface ModalAprovacaoProps {
  open: boolean;
  nomeDoProduto: string;
  novos: IngredienteACriar[];
  enviando: boolean;
  mensagemDeErro: string;
  onConfirmar: () => void;
  onClose: () => void;
}

function ModalAprovacao({
  open,
  nomeDoProduto,
  novos,
  enviando,
  mensagemDeErro,
  onConfirmar,
  onClose,
}: ModalAprovacaoProps) {
  const plural = novos.length > 1;

  return (
    <Modal
      open={open}
      title="Aprovar com ingredientes novos?"
      onClose={onClose}
    >
      <div className={styles.corpo}>
        <p>
          Aprovar "{nomeDoProduto}" publica o produto no catálogo e adiciona{" "}
          {plural ? `${novos.length} ingredientes` : "1 ingrediente"} à base
          como não {plural ? "verificados" : "verificado"}:
        </p>

        <ul className={styles.lista}>
          {novos.map((ingrediente) => (
            <li key={ingrediente.position} className={styles.item}>
              {ingrediente.inciName}
            </li>
          ))}
        </ul>

        <p className={styles.aviso}>
          Confira a grafia antes de aprovar. Um erro de leitura do OCR entraria
          na base com o nome errado.
        </p>

        {mensagemDeErro === "" ? null : (
          <p className={styles.erro} role="alert">
            {mensagemDeErro}
          </p>
        )}

        <div className={styles.acoes}>
          <Button onClick={onConfirmar} disabled={enviando}>
            {enviando ? "Aprovando..." : "Aprovar mesmo assim"}
          </Button>

          <Button variant="secondary" onClick={onClose} disabled={enviando}>
            Voltar e revisar
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ModalAprovacao;
