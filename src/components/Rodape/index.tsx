import { Link } from 'react-router-dom';
import './style.css';

export function Rodape() {
  return (
    <footer className="rodape">
      <div className="rodape-marca">
        <span className="rodape-nome">Venus</span>
        <p>
          O rótulo inteiro, traduzido: o que faz bem para você, para o planeta e para quem
          produz.
        </p>
      </div>

      <nav aria-label="Links do rodapé" className="rodape-colunas">
        <div>
          <h2 className="rodape-titulo">Produto</h2>
          <ul>
            <li><Link to="/busca">Buscar produto</Link></li>
            <li><Link to="/">Início</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="rodape-titulo">Empresa</h2>
          <ul>
            <li><Link to="/sobre">Sobre a Venus</Link></li>
            <li><Link to="/metodologia">Metodologia dos scores</Link></li>
            <li><Link to="/fontes">Fontes</Link></li>
          </ul>
        </div>
      </nav>
    </footer>
  );
}
