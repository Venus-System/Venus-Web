import { useTituloDaPagina } from "../../hooks/useTituloDaPagina";
import { extrairAtualizacao, extrairTitulos } from "../../utils/markdown";
import BackButton from "../BackButton";
import LayoutSimples from "../LayoutSimples";
import Markdown from "../Markdown";
import TableOfContents from "../TableOfContents";
import styles from "./styles.module.css";

interface DocumentLayoutProps {
  title: string;
  content: string;
}

function DocumentLayout({ title, content }: DocumentLayoutProps) {
  useTituloDaPagina(title);
  const secoes = extrairTitulos(content).map((titulo) => ({
    id: titulo.id,
    text: titulo.texto,
  }));
  const atualizacao = extrairAtualizacao(content);

  return (
    <LayoutSimples>
      <article className={styles.document}>
        <div className={styles.cabecalho}>
          <BackButton fallback="/pesquisa" />
          <h1 className={styles.title}>{title}</h1>
        </div>
        {atualizacao === null ? null : (
          <p className={styles.updated}>Última atualização: {atualizacao}</p>
        )}
        <TableOfContents items={secoes} label="Seções do documento" />
        <Markdown content={content} />
      </article>
    </LayoutSimples>
  );
}

export default DocumentLayout;
