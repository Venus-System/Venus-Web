import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BarraNota } from '../../components/BarraNota';
import { EstadoCarregando } from '../../components/EstadoCarregando';
import { MensagemErro } from '../../components/MensagemErro';
import { SeloRisco } from '../../components/SeloRisco';
import { obterAnalise, obterProduto } from '../../services/produtos';
import type { AnaliseExibicao, ProdutoDetalhado } from '../../types';
import './style.css';

interface EstadoProduto {
  produto: ProdutoDetalhado | null;
  analise: AnaliseExibicao | null;
  carregando: boolean;
  erro: string | null;
}

const ESTADO_INICIAL: EstadoProduto = {
  produto: null,
  analise: null,
  carregando: true,
  erro: null
};

export function Produto() {
  const { slug } = useParams<{ slug: string }>();
  const [estado, setEstado] = useState<EstadoProduto>(ESTADO_INICIAL);

  useEffect(() => {
    if (slug === undefined || slug.trim() === '') {
      setEstado({
        produto: null,
        analise: null,
        carregando: false,
        erro: 'Endereço inválido: nenhum produto foi indicado.'
      });
      return;
    }

    const controlador = new AbortController();

    async function carregar(identificador: string) {
      setEstado({ produto: null, analise: null, carregando: true, erro: null });
      try {
        const [detalhe, analise] = await Promise.all([
          obterProduto(identificador, controlador.signal),
          obterAnalise(identificador, controlador.signal)
        ]);
        setEstado({ produto: detalhe, analise, carregando: false, erro: null });
      } catch (erro) {
        if (erro instanceof DOMException && erro.name === 'AbortError') {
          return;
        }
        const mensagem =
          erro instanceof Error ? erro.message : 'Não foi possível carregar o produto.';
        setEstado({ produto: null, analise: null, carregando: false, erro: mensagem });
      }
    }

    void carregar(slug);

    return () => controlador.abort();
  }, [slug]);

  if (estado.carregando) {
    return <EstadoCarregando mensagem="Carregando a análise do produto" />;
  }

  if (estado.erro !== null) {
    return (
      <>
        <MensagemErro mensagem={estado.erro} />
        <Link to="/busca">Voltar para a busca</Link>
      </>
    );
  }

  if (estado.produto === null || estado.analise === null) {
    return <MensagemErro mensagem="Não encontramos esse produto." />;
  }

  const { produto } = estado.produto;
  const { notasProduto, ingredientes, avisos, personalizada } = estado.analise;

  return (
    <article className="produto">
      <nav aria-label="Você está aqui" className="produto-caminho">
        <Link to="/busca">Analisar</Link> <span aria-hidden="true">/</span>{' '}
        <span aria-current="page">{produto.nome}</span>
      </nav>

      <div className="produto-topo">
        <div className="produto-imagem" aria-hidden="true" />

        <div>
          <p className="produto-marca">
            {produto.marca?.nome} · {produto.categoria?.nome}
          </p>
          <h1 className="produto-nome">{produto.nome}</h1>

          <p className="produto-nota">
            <strong>{notasProduto.notaGeral}</strong>
            <span className="produto-nota-total">/100</span>
          </p>
          <p className="produto-nota-sub">
            {personalizada === null
              ? 'Nota geral da fórmula, igual para todo mundo.'
              : 'Nota cruzada com o seu perfil.'}
          </p>

          <BarraNota rotulo="Saúde" valor={notasProduto.notaSaude} dimensao="saude" />
          <BarraNota rotulo="Ambiental" valor={notasProduto.notaAmbiental} dimensao="ambiental" />
          <BarraNota rotulo="Ético" valor={notasProduto.notaEtica} dimensao="etica" />
        </div>
      </div>

      <section aria-labelledby="titulo-avisos" className="produto-painel">
        <h2 id="titulo-avisos">
          {personalizada === null ? 'O que este produto tem' : 'Para você'}
        </h2>
        <ul className="produto-avisos">
          {avisos.map((aviso) => (
            <li key={aviso.titulo}>
              <SeloRisco nivel={aviso.nivel} texto={aviso.titulo} />
              <p>{aviso.descricao}</p>
            </li>
          ))}
        </ul>

        {personalizada === null ? (
          <div className="produto-convite">
            <h3>Veja este produto para a sua pele</h3>
            <p>
              Com um perfil, a Venus cruza esta fórmula com as suas alergias, condições e
              valores.
            </p>
            <Link to="/cadastro" className="botao">
              Criar conta grátis
            </Link>
          </div>
        ) : null}
      </section>

      <section aria-labelledby="titulo-ingredientes">
        <h2 id="titulo-ingredientes" className="produto-secao">
          Um rótulo, cada item explicado
        </h2>
        <ul className="produto-ingredientes">
          {ingredientes.map((ingrediente) => (
            <li key={ingrediente.ingredienteId}>
              <div className="ingrediente-cabecalho">
                <h3>{ingrediente.nomeComum}</h3>
                <SeloRisco nivel={ingrediente.nivel} texto={ingrediente.nomeInci} />
              </div>
              <p>{ingrediente.explicacao}</p>
            </li>
          ))}
        </ul>
        <p className="produto-metodologia">
          <Link to="/metodologia">Como calculamos estas notas</Link>
        </p>
      </section>
    </article>
  );
}
