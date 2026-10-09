import Button from "../Button";
import Input from "../Input";
import ListaSuspensa from "../ListaSuspensa";
import type { SelectOption } from "../ListaSuspensa";
import type { EstadoCatalogo } from "../../hooks/useCatalogoDaRevisao";
import type { OpcaoDoCatalogo } from "../../types/admin";
import styles from "./styles.module.css";

export interface ValoresDoProduto {
  nome: string;
  marcaId: string;
  categoriaId: string;
}

export interface ErrosDoProduto {
  nome: string | null;
  marca: string | null;
  categoria: string | null;
}

interface CamposProdutoProps {
  valores: ValoresDoProduto;
  erros: ErrosDoProduto;
  marcaLida: string;
  categoriaLida: string;
  catalogo: EstadoCatalogo;
  onMudar: (valores: ValoresDoProduto) => void;
  onTentarDeNovo: () => void;
}

export const ID_NOME_DO_PRODUTO = "produto-nome";
export const ID_MARCA = "produto-marca";
export const ID_CATEGORIA = "produto-categoria";

function paraOpcoes(opcoes: OpcaoDoCatalogo[]): SelectOption<string>[] {
  return opcoes.map((opcao) => ({ value: String(opcao.id), label: opcao.name }));
}

function CamposProduto({
  valores,
  erros,
  marcaLida,
  categoriaLida,
  catalogo,
  onMudar,
  onTentarDeNovo,
}: CamposProdutoProps) {
  return (
    <fieldset className={styles.campos}>
      <legend className={styles.titulo}>Produto no catálogo</legend>

      <Input
        id={ID_NOME_DO_PRODUTO}
        label="Nome do produto"
        value={valores.nome}
        onChange={(evento) => onMudar({ ...valores, nome: evento.target.value })}
        error={erros.nome ?? undefined}
      />

      <p className={styles.lido}>
        Lido na embalagem: marca "{marcaLida}", categoria "{categoriaLida}".
      </p>

      {catalogo.status === "carregando" ? (
        <p className={styles.estado} aria-live="polite">
          Carregando marcas e categorias...
        </p>
      ) : null}

      {catalogo.status === "erro" ? (
        <div className={styles.estado}>
          <p role="alert">{catalogo.mensagem}</p>

          <Button variant="secondary" onClick={onTentarDeNovo}>
            Tentar de novo
          </Button>
        </div>
      ) : null}

      {catalogo.status === "pronto" ? (
        <div className={styles.listas}>
          <ListaSuspensa
            id={ID_MARCA}
            label="Marca"
            placeholder="Escolha a marca"
            options={paraOpcoes(catalogo.catalogo.brands)}
            value={valores.marcaId}
            onChange={(marcaId) => onMudar({ ...valores, marcaId })}
            error={erros.marca ?? undefined}
          />

          <ListaSuspensa
            id={ID_CATEGORIA}
            label="Categoria"
            placeholder="Escolha a categoria"
            options={paraOpcoes(catalogo.catalogo.categories)}
            value={valores.categoriaId}
            onChange={(categoriaId) => onMudar({ ...valores, categoriaId })}
            error={erros.categoria ?? undefined}
          />
        </div>
      ) : null}
    </fieldset>
  );
}

export default CamposProduto;
