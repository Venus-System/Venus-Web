import { Link } from "react-router-dom";
import logo from "../../assets/Logo.svg";
import styles from "./styles.module.css";

interface FooterProps {
  year?: number;
}

interface LinkColumn {
  id: string;
  title: string;
  links: { to: string; label: string }[];
}

const COLUMNS: LinkColumn[] = [
  {
    id: "product",
    title: "Produto",
    links: [
      { to: "/pesquisa", label: "Analisar" },
      { to: "/comparar", label: "Comparar" },
      { to: "/dashboard", label: "Dashboard" },
      { to: "/historico", label: "Histórico" },
    ],
  },
  {
    id: "company",
    title: "Empresa",
    links: [
      { to: "/sobre", label: "Sobre a Venus" },
      { to: "/metodologia", label: "Metodologia" },
      { to: "/fontes", label: "Fontes" },
    ],
  },
];

function Footer({ year = new Date().getFullYear() }: FooterProps) {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.brand}>
          <Link to="/" className={styles.brandLink}>
            <img src={logo} alt="" className={styles.logo} />
            <span className={styles.brandName}>Venus</span>
          </Link>

          <p className={styles.tagline}>
            O rótulo inteiro, traduzido para a sua pele e para o planeta.
          </p>
        </div>

        <div className={styles.columns}>
          {COLUMNS.map((column) => (
            <div className={styles.column} key={column.id}>
              <p className={styles.columnTitle} id={`footer-${column.id}`}>
                {column.title}
              </p>

              <ul
                className={styles.list}
                aria-labelledby={`footer-${column.id}`}
              >
                {column.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className={styles.link}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <p className={styles.watermark} aria-hidden="true">
        Venus
      </p>

      <div className={styles.bottom}>
        <small>© {year} Venus</small>

        <ul className={styles.legal}>
          <li>
            <Link to="/privacidade" className={styles.link}>
              Privacidade
            </Link>
          </li>
          <li>
            <Link to="/termos" className={styles.link}>
              Termos
            </Link>
          </li>
          <li>
            <Link to="/cookies" className={styles.link}>
              Cookies
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}

export default Footer;
