import type { NivelSemaforo } from '../../types';
import './style.css';

interface SeloRiscoProps {
  nivel: NivelSemaforo;
  texto: string;
}

const ROTULOS: Record<NivelSemaforo, string> = {
  seguro: 'Aprovado',
  atencao: 'Pede atenção',
  evitar: 'Melhor evitar',
  sem_dados: 'Não verificado'
};

export function SeloRisco({ nivel, texto }: SeloRiscoProps) {
  return (
    <span className={`selo selo-${nivel}`}>
      <span className="apenas-leitor-de-tela">{ROTULOS[nivel]}: </span>
      {texto}
    </span>
  );
}
