import Selo from "../Selo";
import type { SeloVariante } from "../Selo";
import type {
  EstadoIngrediente,
  IngredienteInterpretado,
} from "../../types/admin";
import styles from "./styles.module.css";

const SELO_DO_ESTADO: Record<
  EstadoIngrediente,
  { label: string; variant: SeloVariante }
> = {
  known: { label: "conhecido", variant: "contorno" },
  alias: { label: "conhecido", variant: "contorno" },
  ambiguous: { label: "ambíguo", variant: "alerta" },
  new: { label: "novo na base", variant: "destaque" },
};

interface ListaIngredientesProps {
  ingredientes: IngredienteInterpretado[];
  selecionado: string | null;
  onSelecionar: (id: string) => void;
}

function ListaIngredientes({
  ingredientes,
  selecionado,
  onSelecionar,
}: ListaIngredientesProps) {
  return (
    <section className={styles.painel} aria-labelledby="titulo-interpretado">
      <div className={styles.topo}>
        <h3 id="titulo-interpretado" className={styles.titulo}>
          Interpretado pelo sistema
        </h3>

        <div className={styles.legenda} aria-hidden="true">
          <Selo label="conhecido" />
          <Selo label="ambíguo" variant="alerta" />
          <Selo label="novo na base" variant="destaque" />
        </div>
      </div>

      <p id="dica-ingredientes" className="texto-oculto">
        Escolha um ingrediente para destacar onde ele aparece no texto lido.
      </p>

      <ol className={styles.lista} aria-describedby="dica-ingredientes">
        {ingredientes.map((ingrediente) => {
          const ativo = ingrediente.id === selecionado;

          return (
            <li key={ingrediente.id}>
              <button
                type="button"
                className={ativo ? styles.itemAtivo : styles.item}
                aria-pressed={ativo}
                onClick={() => onSelecionar(ingrediente.id)}
              >
                <span className={styles.numero} aria-hidden="true">
                  {ingrediente.position}
                </span>

                <span className={styles.nome}>{ingrediente.name}</span>

                <Selo
                  label={SELO_DO_ESTADO[ingrediente.status].label}
                  variant={SELO_DO_ESTADO[ingrediente.status].variant}
                />
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export default ListaIngredientes;
