import './style.css';

interface EstadoCarregandoProps {
  mensagem?: string;
}

export function EstadoCarregando({ mensagem = 'Carregando' }: EstadoCarregandoProps) {
  return (
    <div className="carregando" role="status" aria-live="polite">
      <span className="carregando-roda" aria-hidden="true" />
      <span>{mensagem}</span>
    </div>
  );
}
