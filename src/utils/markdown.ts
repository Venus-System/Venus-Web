import { parser, RuleType } from "markdown-to-jsx/react";
import type { MarkdownToJSX } from "markdown-to-jsx/react";

export const OPCOES_LEITURA: MarkdownToJSX.Options = {
  disableParsingRawHTML: true,
};

export interface TituloDocumento {
  id: string;
  texto: string;
}

function extrairTexto(nos: MarkdownToJSX.ASTNode[]): string {
  return nos
    .map((no) => {
      if (no.type === RuleType.text || no.type === RuleType.codeInline) {
        return no.text;
      }

      if (no.type === RuleType.textFormatted || no.type === RuleType.link) {
        return extrairTexto(no.children);
      }

      return "";
    })
    .join("");
}

export function extrairTitulos(conteudo: string): TituloDocumento[] {
  return parser(conteudo, OPCOES_LEITURA).flatMap((no) =>
    no.type === RuleType.heading && no.level === 2
      ? [{ id: no.id, texto: extrairTexto(no.children) }]
      : [],
  );
}

function ehFrontmatter(
  no: MarkdownToJSX.ASTNode,
): no is MarkdownToJSX.FrontmatterNode {
  return no.type === RuleType.frontmatter;
}

export function extrairAtualizacao(conteudo: string): string | null {
  const frontmatter = parser(conteudo, OPCOES_LEITURA).find(ehFrontmatter);

  if (frontmatter === undefined) {
    return null;
  }

  const achado = /^atualizado:\s*(.+)$/m.exec(frontmatter.text);

  return achado === null ? null : achado[1].trim();
}
