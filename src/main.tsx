import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/global.css';

const elementoRaiz = document.getElementById('root');

if (elementoRaiz === null) {
  throw new Error('Elemento raiz não encontrado no documento.');
}

createRoot(elementoRaiz).render(
  <StrictMode>
    <App />
  </StrictMode>
);
