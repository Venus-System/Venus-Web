import { ScanLine } from "lucide-react";
import { Link } from "react-router-dom";
import type { Envio, SituacaoEnvio } from "../../types/envio";
import Selo from "../Selo";
import type { SeloVariante } from "../Selo";
import styles from "./styles.module.css";

interface SubmissionRowProps {
  envio: Envio;
}

interface Situacao {
  label: string;
  variant: SeloVariante;
  decisao: string | null;
}

const SITUACOES: Record<SituacaoEnvio, Situacao> = {
  in_review: { label: "Em análise", variant: "alerta", decisao: null },
  approved: {
    label: "Aprovado, entrando no catálogo",
    variant: "contorno",
    decisao: "Aprovado em",
  },
  published: { label: "Publicado", variant: "sucesso", decisao: "Aprovado em" },
  rejected: { label: "Recusado", variant: "destaque", decisao: "Recusado em" },
};

const FORMATO_DATA = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "short",
});

function formatarData(data: string | null): string | null {
  if (data === null) {
    return null;
  }

  const lida = new Date(data);

  return Number.isNaN(lida.getTime()) ? null : FORMATO_DATA.format(lida);
}

function SubmissionRow({ envio }: SubmissionRowProps) {
  const situacao = SITUACOES[envio.status];
  const nome = envio.name ?? "Nome não identificado na foto";
  const enviadoEm = formatarData(envio.submittedAt);
  const decididoEm = formatarData(envio.decidedAt);

  const detalhes = [
    envio.brandName,
    enviadoEm === null ? null : `Enviado em ${enviadoEm}`,
    situacao.decisao === null || decididoEm === null
      ? null
      : `${situacao.decisao} ${decididoEm}`,
  ].filter((detalhe): detalhe is string => detalhe !== null);

  return (
    <article className={styles.row}>
      <span className={styles.thumb}>
        {envio.photoUrl === null ? (
          <ScanLine className={styles.icone} aria-hidden="true" />
        ) : (
          <img src={envio.photoUrl} alt="" className={styles.image} />
        )}
      </span>

      <div className={styles.corpo}>
        <div className={styles.topo}>
          <h3 className={styles.name}>
            {envio.status === "published" && envio.productSlug !== null ? (
              <Link to={`/produto/${envio.productSlug}`}>{nome}</Link>
            ) : (
              nome
            )}
          </h3>

          <Selo label={situacao.label} variant={situacao.variant} />
        </div>

        {detalhes.length > 0 ? (
          <p className={styles.detail}>{detalhes.join(" · ")}</p>
        ) : null}

        {envio.status === "rejected" && envio.rejectionReason !== null ? (
          <p className={styles.motivo}>
            <strong>Motivo da recusa:</strong> {envio.rejectionReason}
          </p>
        ) : null}
      </div>
    </article>
  );
}

export default SubmissionRow;
