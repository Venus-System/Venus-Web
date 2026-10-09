import { forwardRef } from "react";
import styles from "./styles.module.css";

export interface ErroResumo {
  id: string;
  mensagem: string;
}

interface ResumoErrosProps {
  items: ErroResumo[];
}

const ResumoErros = forwardRef<HTMLDivElement, ResumoErrosProps>(
  function ResumoErros({ items }, ref) {
    if (items.length === 0) {
      return null;
    }

    const tituloId = "resumo-erros-titulo";

    return (
      <div
        ref={ref}
        className={styles.resumo}
        tabIndex={-1}
        aria-labelledby={tituloId}
      >
        <h2 id={tituloId} className={styles.titulo}>
          {items.length === 1
            ? "1 resposta precisa de atenção"
            : `${items.length} respostas precisam de atenção`}
        </h2>

        <ul className={styles.lista}>
          {items.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`}>{item.mensagem}</a>
            </li>
          ))}
        </ul>
      </div>
    );
  },
);

export default ResumoErros;
