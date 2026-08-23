import { useState } from 'react';

interface PropsContador {
  titulo: string;
  passo: number;
}

function Contador({ titulo, passo }: PropsContador) {
  const [valor, setValor] = useState(0);

  return (
    <section className="contador">
      <h2>{titulo}</h2>

      <p className="contador__valor">{valor}</p>

      <button
        className="botao"
        type="button"
        onClick={() => setValor((atual) => atual + passo)}
      >
        Somar {passo}
      </button>

      <button className="botao" type="button" onClick={() => setValor(0)}>
        Zerar
      </button>
    </section>
  );
}

export default Contador;
