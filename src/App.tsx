import { Link, Route, Routes } from 'react-router-dom';
import Inicio from './pages/Inicio';
import Sobre from './pages/Sobre';

function App() {
  return (
    <>
      <header className="cabecalho">
        <nav aria-label="Navegação principal">
          <Link to="/">Início</Link>
          <Link to="/sobre">Sobre</Link>
        </nav>
      </header>

      <main className="conteudo">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/sobre" element={<Sobre />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
