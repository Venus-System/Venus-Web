<<<<<<< Updated upstream
import { Route, Routes } from 'react-router-dom';
import Inicio from './pages/Inicio';
=======
import { Route, Routes } from "react-router-dom";
import Componentes from "./pages/Componentes";
import Inicio from "./pages/Inicio";
>>>>>>> Stashed changes

function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/componentes" element={<Componentes />} />
    </Routes>
  );
}

export default App;
