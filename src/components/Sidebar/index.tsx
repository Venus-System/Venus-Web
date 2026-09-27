import {
  ArrowLeftRight,
  ArrowRight,
  BookOpen,
  Heart,
  History,
  LayoutGrid,
  ScanLine,
  Search,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { FormEvent } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAutenticacao } from "../../hooks/useAutenticacao";
import logo from "../../assets/Logo.svg";
import Button from "../Button";
import Input from "../Input";
import styles from "./styles.module.css";

interface SidebarProps {
  onSearch?: (term: string) => void;
  onScan?: () => void;
}

interface NavLinkItem {
  to: string;
  label: string;
  Icon: LucideIcon;
  emBreve?: boolean;
}

interface NavGroup {
  id: string;
  title: string;
  links: NavLinkItem[];
}

const GROUPS: NavGroup[] = [
  {
    id: "analyze",
    title: "Analisar",
    links: [
      { to: "/pesquisa", label: "Buscar produto", Icon: Search },
      {
        to: "/comparar",
        label: "Comparar",
        Icon: ArrowLeftRight,
        emBreve: true,
      },
    ],
  },
  {
    id: "my-space",
    title: "Meu Espaço",
    links: [
      { to: "/dashboard", label: "Dashboard", Icon: LayoutGrid },
      { to: "/historico", label: "Histórico", Icon: History, emBreve: true },
      { to: "/favoritos", label: "Favoritos", Icon: Heart, emBreve: true },
    ],
  },
  {
    id: "about",
    title: "Sobre Venus",
    links: [{ to: "/metodologia", label: "Como funciona", Icon: BookOpen }],
  },
];

function Sidebar({ onSearch, onScan }: SidebarProps) {
  const { usuario, fotoUrl } = useAutenticacao();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!onSearch) {
      return;
    }

    const term = new FormData(event.currentTarget).get("term");
    onSearch(typeof term === "string" ? term : "");
  }

  return (
    <nav className={styles.sidebar} aria-label="Navegação principal">
      <Link to="/" className={styles.brand}>
        <img src={logo} alt="" className={styles.logo} />
        <span className={styles.brandName}>Venus</span>
      </Link>

      <form role="search" onSubmit={handleSubmit} className={styles.search}>
        <Input
          id="sidebar-search"
          name="term"
          type="search"
          label="Buscar produto"
          placeholder="Buscar produto..."
          icon={<Search />}
          hideLabel
        />
      </form>

      <Button onClick={onScan} className={styles.scan}>
        <ScanLine className={styles.buttonIcon} aria-hidden="true" />
        Escanear rótulo
      </Button>

      {GROUPS.map((group) => (
        <div className={styles.group} key={group.id}>
          <p className={styles.groupTitle} id={`group-${group.id}`}>
            {group.title}
          </p>

          <ul className={styles.list} aria-labelledby={`group-${group.id}`}>
            {group.links.map((link) => (
              <li key={link.to}>
                {link.emBreve === true ? (
                  <span className={styles.linkEmBreve}>
                    <link.Icon className={styles.linkIcon} aria-hidden="true" />
                    {link.label}
                    <span className={styles.emBreve}>Em breve</span>
                  </span>
                ) : (
                  <NavLink
                    to={link.to}
                    className={({ isActive }) =>
                      [styles.link, isActive ? styles.linkActive : ""]
                        .filter(Boolean)
                        .join(" ")
                    }
                  >
                    <link.Icon className={styles.linkIcon} aria-hidden="true" />
                    {link.label}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}

      {usuario  ? (
        <Link to="/perfil" className={styles.user}>
          <span className={styles.avatar} aria-hidden="true">
            {fotoUrl === null ? (
              usuario.name.charAt(0)
            ) : (
              <img className={styles.avatarFoto} src={fotoUrl} alt="" />
            )}
          </span>

          <span className={styles.userInfo}>
            <span className={styles.userName}>{usuario .name}</span>
            <span className={styles.userAction}>
              Ver meu perfil
              <ArrowRight className={styles.userIcon} aria-hidden="true" />
            </span>
          </span>
        </Link>
      ) : null}
    </nav>
  );
}

export default Sidebar;
