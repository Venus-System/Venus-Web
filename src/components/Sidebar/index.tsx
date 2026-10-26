import {
  ArrowLeftRight,
  ArrowRight,
  BookOpen,
  Heart,
  History,
  ImageUp,
  LayoutGrid,
  Search,
  ShieldAlert,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAutenticacao } from "../../hooks/useAutenticacao";
import logo from "../../assets/Logo.svg";
import Button from "../Button";
import Input from "../Input";
import { MAXIMO_DA_BUSCA } from "../../utils/validacao";
import styles from "./styles.module.css";

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
      { to: "/comparar", label: "Comparar", Icon: ArrowLeftRight },
      { to: "/reacao", label: "Tive uma reação", Icon: ShieldAlert },
    ],
  },
  {
    id: "my-space",
    title: "Meu espaço",
    links: [
      { to: "/dashboard", label: "Dashboard", Icon: LayoutGrid },
      { to: "/historico", label: "Histórico", Icon: History },
      { to: "/favoritos", label: "Favoritos", Icon: Heart },
    ],
  },
  {
    id: "about",
    title: "Sobre a Venus",
    links: [{ to: "/metodologia", label: "Metodologia", Icon: BookOpen }],
  },
];

interface SidebarProps {
  headerAction?: ReactNode;
}

function Sidebar({ headerAction }: SidebarProps) {
  const { usuario, fotoUrl } = useAutenticacao();
  const navegar = useNavigate();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const valor = new FormData(event.currentTarget).get("term");
    const termo = typeof valor === "string" ? valor.trim() : "";

    navegar(
      termo === "" ? "/pesquisa" : `/pesquisa?termo=${encodeURIComponent(termo)}`,
    );
  }

  return (
    <nav
      id="navegacao-principal"
      tabIndex={-1}
      className={
        headerAction === undefined
          ? styles.sidebar
          : `${styles.sidebar} ${styles.comAcao}`
      }
      aria-label="Navegação principal"
    >
      <div className={styles.brand}>
        {headerAction}
        <img src={logo} alt="" className={styles.logo} />
        <span className={styles.brandName}>Venus</span>
      </div>

      <form role="search" onSubmit={handleSubmit} className={styles.search}>
        <Input
          id="sidebar-search"
          maxLength={MAXIMO_DA_BUSCA}
          name="term"
          type="search"
          label="Buscar produto"
          placeholder="Buscar produto..."
          icon={<Search />}
          hideLabel
        />
      </form>

      <Button to="/escanear" className={styles.scan}>
        <ImageUp className={styles.buttonIcon} aria-hidden="true" />
        Buscar por foto
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

      {usuario ? (
        <Link to="/perfil" className={styles.user}>
          <span className={styles.avatar} aria-hidden="true">
            {fotoUrl === null ? (
              usuario.name.charAt(0)
            ) : (
              <img className={styles.avatarFoto} src={fotoUrl} alt="" />
            )}
          </span>

          <span className={styles.userInfo}>
            <span className={styles.userName}>{usuario.name}</span>
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
