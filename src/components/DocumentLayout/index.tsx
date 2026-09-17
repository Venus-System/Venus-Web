import { extrairAtualizacao, extrairTitulos } from "../../utils/markdown";
import Markdown from "../Markdown";
import TableOfContents from "../TableOfContents";
import styles from "./styles.module.css";

interface DocumentLayoutProps {
  title: string;
  content: string;
}

function DocumentLayout({ title, content }: DocumentLayoutProps) {
  const secoes = extrairTitulos(content).map((titulo) => ({
    id: titulo.id,
    text: titulo.texto,
  }));
  const atualizacao = extrairAtualizacao(content);

  return (
    <article className={styles.document}>
      <h1 className={styles.title}>{title}</h1>
      {atualizacao === null ? null : (
        <p className={styles.updated}>Última atualização: {atualizacao}</p>
      )}
      <TableOfContents items={secoes} label="Seções do documento" />
      <Markdown content={content} />
    </article>
  );
}

export default DocumentLayout;
