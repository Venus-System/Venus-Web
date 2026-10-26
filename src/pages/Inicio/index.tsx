import { useTituloDaPagina } from "../../hooks/useTituloDaPagina";

function Inicio() {
  useTituloDaPagina("");

  return (
    <main tabIndex={-1}>
      <h1>Venus</h1>

      <p>A aplicação está em construção.</p>
    </main>
  );
}

export default Inicio;
