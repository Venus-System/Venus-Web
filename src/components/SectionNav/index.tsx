import { NavLink } from "react-router-dom";
import styles from "./styles.module.css";

const PAGINAS = [
  { to: "/sobre", label: "Sobre" },
  { to: "/metodologia", label: "Metodologia" },
  { to: "/fontes", label: "Fontes" },
];

function SectionNav() {
  return (
    <nav className={styles.nav} aria-label="Seções sobre a Venus">
      <ul className={styles.list}>
        {PAGINAS.map((pagina) => (
          <li key={pagina.to}>
            <NavLink
              to={pagina.to}
              className={({ isActive }) =>
                isActive ? styles.linkActive : styles.link
              }
            >
              {pagina.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default SectionNav;
