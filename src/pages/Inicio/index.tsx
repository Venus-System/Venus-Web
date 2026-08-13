import Contador from '../../components/Contador';

function Inicio() {
  return (
    <>
      <h1>Teste do React</h1>

      <p>
        Os dois contadores abaixo usam o mesmo componente com props diferentes.
        Cada um guarda o próprio estado.
      </p>

      <Contador titulo="Contador de um em um" passo={1} />
      <Contador titulo="Contador de cinco em cinco" passo={5} />
    </>
  );
}

export default Inicio;
