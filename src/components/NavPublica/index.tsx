import { Link, NavLink } from 'react-router-dom';
import './style.css';

export function NavPublica() {
  return (
    <header className="nav-publica">
      <Link to="/" className="nav-marca">
        Venus
      </Link>

      <nav aria-label="Navegação principal">
        <ul className="nav-lista">
          <li>
            <NavLink to="/busca" className={({ isActive }) => (isActive ? 'ativo' : undefined)}>
              Buscar produto
            </NavLink>
          </li>
          <li>
            <NavLink to="/metodologia" className={({ isActive }) => (isActive ? 'ativo' : undefined)}>
              Como funciona
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className="nav-acoes">
        <Link to="/entrar" className="nav-entrar">
          Entrar
        </Link>
        <Link to="/cadastro" className="botao">
          Criar conta grátis
        </Link>
      </div>
    </header>
  );
}
