import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Busca } from './pages/Busca';
import { Landing } from './pages/Landing';
import { NaoEncontrado } from './pages/NaoEncontrado';
import { Produto } from './pages/Produto';

export function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/busca" element={<Busca />} />
          <Route path="/produto/:slug" element={<Produto />} />
          <Route path="*" element={<NaoEncontrado />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
