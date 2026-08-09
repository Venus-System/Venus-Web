import { Link } from 'react-router-dom';
import type { ProdutoResumo } from '../../types';
import { SeloRisco } from '../SeloRisco';
import './style.css';

interface CardProdutoProps {
  produto: ProdutoResumo;
}

function nivelPorNota(nota: number) {
  if (nota <= 20) return 'evitar' as const;
  if (nota < 60) return 'atencao' as const;
  return 'seguro' as const;
}

export function CardProduto({ produto }: CardProdutoProps) {
  const nivel = nivelPorNota(produto.notaGeral);

  return (
    <article className="card-produto">
      <div className="card-imagem" aria-hidden="true" />

      <div className="card-corpo">
        <h3 className="card-nome">
          <Link to={`/produto/${produto.slug}`}>{produto.nome}</Link>
        </h3>
        <p className="card-marca">
          {produto.marca} · {produto.categoria}
        </p>
        <SeloRisco nivel={nivel} texto={`Nota ${produto.notaGeral}`} />
      </div>
    </article>
  );
}
