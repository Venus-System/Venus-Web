import { Link } from "react-router-dom";
import styles from "./styles.module.css";

interface ConsentimentoSaudeProps {
  id: string;
  checked: boolean;
  onChange: (autorizado: boolean) => void;
}

function ConsentimentoSaude({
  id,
  checked,
  onChange,
}: ConsentimentoSaudeProps) {
  const tituloId = `${id}-titulo`;
  const avisoId = `${id}-aviso`;

  return (
    <section className={styles.card} aria-labelledby={tituloId}>
      <h2 id={tituloId} className={styles.title}>
        Antes das perguntas sobre pele e saúde
      </h2>

      <p className={styles.text}>
        As próximas respostas — tipo de pele, fototipo, sensibilidade, couro
        cabeludo, gestação, condições de pele e alergias — são dados pessoais
        sensíveis. A Venus usa essas respostas só para cruzar com a lista de
        ingredientes e montar a sua análise pessoal. Nada vai para marcas ou
        anunciantes.
      </p>

      <p className={styles.text}>
        Autorizar é opcional. Sem isso, o restante do questionário funciona e
        você continua vendo a avaliação geral dos produtos — o que muda é que a
        análise não considera a sua pele. Você pode mudar essa escolha depois,
        no seu perfil.
      </p>

      <div className={styles.choice}>
        <input
          id={id}
          type="checkbox"
          className={styles.checkbox}
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          aria-describedby={avisoId}
        />

        <label htmlFor={id}>
          Autorizo o uso das minhas respostas sobre pele e saúde para gerar a
          minha análise pessoal
        </label>
      </div>

      <p id={avisoId} className={styles.aviso}>
        Leia a{" "}
        <Link to="/privacidade" target="_blank" rel="noopener noreferrer">
          Política de Privacidade
        </Link>{" "}
        e os{" "}
        <Link to="/termos" target="_blank" rel="noopener noreferrer">
          Termos de Uso
        </Link>
        . Os dois abrem em uma nova aba.
      </p>
    </section>
  );
}

export default ConsentimentoSaude;
