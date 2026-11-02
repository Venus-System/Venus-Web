import { Menu } from "lucide-react";
import logo from "../../assets/Logo.svg";
import styles from "./styles.module.css";

interface TopBarProps {
  menuId: string;
  menuOpen: boolean;
  onOpenMenu: () => void;
}

function TopBar({ menuId, menuOpen, onOpenMenu }: TopBarProps) {
  return (
    <header className={styles.barra}>
      <button
        id="botao-do-menu"
        type="button"
        className={styles.menu}
        aria-label="Abrir menu"
        aria-haspopup="dialog"
        aria-expanded={menuOpen}
        aria-controls={menuId}
        onClick={onOpenMenu}
      >
        <Menu className={styles.icone} aria-hidden="true" />
      </button>

      <img src={logo} alt="" className={styles.logo} />
      <span className={styles.nome}>Venus</span>
    </header>
  );
}

export default TopBar;
