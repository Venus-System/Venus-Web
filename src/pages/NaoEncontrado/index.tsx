import { Link } from 'react-router-dom';

export function NaoEncontrado() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 0' }}>
      <p
        style={{
          fontSize: 11.5,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          fontWeight: 700,
          color: 'var(--crimson)'
        }}
      >
        Erro 404
      </p>
      <h1 style={{ fontSize: 40, marginBottom: 14 }}>Esta página não existe.</h1>
      <p style={{ maxWidth: 460, margin: '0 auto 28px' }}>
        O endereço pode ter mudado, ou o produto que você procura ainda não está no catálogo.
      </p>
      <Link to="/" className="botao" style={{ textDecoration: 'none' }}>
        Voltar para o início
      </Link>
    </div>
  );
}
