import './style.css';

interface MensagemErroProps {
  mensagem: string;
  aoTentarNovamente?: () => void;
}

export function MensagemErro({ mensagem, aoTentarNovamente }: MensagemErroProps) {
  return (
    <div className="erro" role="alert">
      <p className="erro-texto">{mensagem}</p>
      {aoTentarNovamente ? (
        <button type="button" className="botao botao-secundario" onClick={aoTentarNovamente}>
          Tentar novamente
        </button>
      ) : null}
    </div>
  );
}
