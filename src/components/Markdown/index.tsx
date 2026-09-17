import MarkdownToJsx from "markdown-to-jsx/react";
import type { MarkdownToJSX } from "markdown-to-jsx/react";
import DocumentLink from "../DocumentLink";
import ScrollableTable from "../ScrollableTable";
import { OPCOES_LEITURA } from "../../utils/markdown";
import styles from "./styles.module.css";

const OPCOES: MarkdownToJSX.Options = {
  ...OPCOES_LEITURA,
  forceBlock: true,
  forceWrapper: true,
  overrides: {
    a: DocumentLink,
    table: ScrollableTable,
    h1: { component: "h2", props: { tabIndex: -1 } },
    h2: { props: { tabIndex: -1 } },
    h3: { props: { tabIndex: -1 } },
    th: { props: { scope: "col" } },
  },
};

interface MarkdownProps {
  content: string;
}

function Markdown({ content }: MarkdownProps) {
  return (
    <MarkdownToJsx className={styles.document} options={OPCOES}>
      {content}
    </MarkdownToJsx>
  );
}

export default Markdown;
