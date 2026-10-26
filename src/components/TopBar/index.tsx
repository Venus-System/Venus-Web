import type { RefObject } from "react";
import { Menu } from "lucide-react";
import logo from "../../assets/Logo.svg";
import styles from "./styles.module.css";

interface TopBarProps {
  menuId: string;
  menuOpen: boolean;
  buttonRef: RefObject<HTMLButtonElement>;
  onOpenMenu: () => void;
}

function TopBar({ menuId, menuOpen, buttonRef, onOpenMenu }: TopBarProps) {
  return (
    <header className={styles.barra}>
      <div className={styles.marca}>
        <img src={logo} alt="" className={styles.logo} />
        <span className={styles.nome}>Venus</span>
      </div>

      <button
        ref={buttonRef}
        type="button"
        className={styles.menu}
        aria-expanded={menuOpen}
        aria-controls={menuId}
        onClick={onOpenMenu}
      >
        <Menu className={styles.icone} aria-hidden="true" />
        Menu
      </button>
    </header>
  );
}

export default TopBar;
