import { useEffect, useState } from 'react';
import { CardProduto } from '../../components/CardProduto';
import { EstadoCarregando } from '../../components/EstadoCarregando';
import { MensagemErro } from '../../components/MensagemErro';
import { pesquisarProdutos } from '../../services/produtos';
import type { ProdutoResumo } from '../../types';
import './style.css';

interface EstadoBusca {
  resultados: ProdutoResumo[];
  carregando: boolean;
  erro: string | null;
}

export function Busca() {
  const [termo, setTermo] = useState<string>('');
  const [termoConfirmado, setTermoConfirmado] = useState<string>('');
  const [estado, setEstado] = useState<EstadoBusca>({
    resultados: [],
    carregando: false,
    erro: null
  });

  useEffect(() => {
    const controlador = new AbortController();

    async function carregar() {
      setEstado({ resultados: [], carregando: true, erro: null });
      try {
        const encontrados = await pesquisarProdutos(termoConfirmado, controlador.signal);
        setEstado({ resultados: encontrados, carregando: false, erro: null });
      } catch (erro) {
        if (erro instanceof DOMException && erro.name === 'AbortError') {
          return;
        }
        const mensagem =
          erro instanceof Error ? erro.message : 'Não foi possível carregar os produtos.';
        setEstado({ resultados: [], carregando: false, erro: mensagem });
      }
    }

    void carregar();

    return () => controlador.abort();
  }, [termoConfirmado]);

  function aoEnviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setTermoConfirmado(termo);
  }

  return (
    <div className="busca">
      <h1 className="busca-titulo">Analise qualquer produto</h1>
      <p className="busca-texto">
        Digite o nome ou a marca. A Venus traduz cada ingrediente e avisa o que importa para a
        sua pele.
      </p>

      <form className="busca-formulario" onSubmit={aoEnviar}>
        <label htmlFor="campo-busca">Nome do produto ou da marca</label>
        <div className="busca-linha">
          <input
            id="campo-busca"
            className="campo"
            type="search"
            value={termo}
            onChange={(evento) => setTermo(evento.target.value)}
            placeholder="Sérum vitamina C"
          />
          <button type="submit" className="botao">
            Analisar
          </button>
        </div>
      </form>

      {estado.carregando ? <EstadoCarregando mensagem="Buscando produtos" /> : null}

      {estado.erro !== null ? (
        <MensagemErro
          mensagem={estado.erro}
          aoTentarNovamente={() => setTermoConfirmado(`${termoConfirmado} `)}
        />
      ) : null}

      {!estado.carregando && estado.erro === null ? (
        <section aria-live="polite">
          <h2 className="busca-subtitulo">
            {estado.resultados.length === 0
              ? 'Nenhum produto encontrado'
              : `${estado.resultados.length} produto(s) encontrado(s)`}
          </h2>

          {estado.resultados.length === 0 ? (
            <p className="busca-vazio">
              Ainda não temos esse produto no catálogo. Você pode enviar a foto do rótulo para
              que ele entre na base.
            </p>
          ) : (
            <ul className="busca-resultados">
              {estado.resultados.map((produto) => (
                <li key={produto.produtoId}>
                  <CardProduto produto={produto} />
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </div>
  );
}
