import { Link } from 'react-router-dom';
import './style.css';

export function Landing() {
  return (
    <div className="landing">
      <section className="landing-capa">
        <p className="landing-olho">Beleza inteligente</p>
        <h1 className="landing-titulo">Saiba o que tem no rótulo.</h1>
        <p className="landing-texto">
          A Venus lê a lista de ingredientes e explica o que cada um faz para a sua pele,
          para o planeta e para quem produz.
        </p>
        <div className="landing-acoes">
          <Link to="/busca" className="botao">
            Analisar um produto
          </Link>
          <Link to="/metodologia" className="botao botao-secundario">
            Como calculamos
          </Link>
        </div>
      </section>

      <section aria-labelledby="titulo-dimensoes" className="landing-dimensoes">
        <h2 id="titulo-dimensoes">Três notas, porque são três perguntas</h2>
        <ul className="dimensoes-lista">
          <li>
            <h3>Saúde</h3>
            <p>A fórmula combina com a sua pele, com as suas condições e com o que você evita.</p>
          </li>
          <li>
            <h3>Impacto ambiental</h3>
            <p>Biodegradabilidade, presença de microplásticos e o material da embalagem.</p>
          </li>
          <li>
            <h3>Ética</h3>
            <p>Origem dos ingredientes, testes em animais e transparência da marca.</p>
          </li>
        </ul>
      </section>
    </div>
  );
}
