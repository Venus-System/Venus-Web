import './style.css';

interface BarraNotaProps {
  rotulo: string;
  valor: number;
  dimensao: 'saude' | 'ambiental' | 'etica';
}

export function BarraNota({ rotulo, valor, dimensao }: BarraNotaProps) {
  const limitado = Math.max(0, Math.min(100, valor));

  return (
    <div className="barra-nota">
      <div className="barra-cabecalho">
        <span className="barra-rotulo">{rotulo}</span>
        <span className={`barra-valor cor-${dimensao}`}>{limitado}%</span>
      </div>
      <div
        className="barra-trilho"
        role="progressbar"
        aria-label={`Nota de ${rotulo}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={limitado}
      >
        <div className={`barra-preenchimento cor-fundo-${dimensao}`} style={{ width: `${limitado}%` }} />
      </div>
    </div>
  );
}
