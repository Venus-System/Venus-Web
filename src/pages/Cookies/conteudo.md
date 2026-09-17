---
atualizado: 17 de setembro de 2026
---

## O resumo

**O Venus não usa cookies de publicidade, de rastreamento ou de terceiros para
fins comerciais.**

O que usamos é armazenamento local no seu navegador, para duas coisas: manter
você conectado e lembrar do seu progresso no questionário de perfil.

## O que guardamos no seu navegador

| O quê | Onde | Para quê | Quando some |
|---|---|---|---|
| Sessão do Firebase Authentication | `localStorage` ou `IndexedDB` | Manter você conectado entre uma página e outra | Ao sair da conta, ou ao fechar o navegador se você não marcou "continuar conectado" |
| Nome e e-mail da conta ativa | `localStorage` ou `sessionStorage` | Mostrar seu nome sem consultar o servidor a cada página | Ao sair da conta |
| Progresso do questionário | `localStorage` | Permitir retomar o questionário depois | Ao concluir o questionário ou limpar os dados do navegador |

**Nenhum desses itens guarda senha.**

A escolha entre `localStorage` e `sessionStorage` é a caixa "continuar
conectado" da tela de entrada: marcada, a sessão sobrevive ao fechamento do
navegador; desmarcada, ela termina junto com a aba.

Tecnicamente, `localStorage` e `sessionStorage` **não são cookies** — são
mecanismos de armazenamento do próprio navegador. Estão descritos aqui porque a
finalidade é a mesma que a de um cookie de sessão, e você tem direito de saber.

## Armazenamento no aplicativo

O aplicativo móvel usa o Google Firebase para guardar dados localmente e
sincronizá-los. Isso está descrito na política de privacidade, na seção sobre
compartilhamento com terceiros.

## Entrada com Google

Se você entrar com a conta Google, a Google pode gravar cookies próprios
durante esse processo, sob a política de privacidade dela. Isso acontece no
domínio da Google, não no do Venus, e não temos controle nem acesso a esses
cookies.

## Análise de uso no aplicativo

O aplicativo móvel usa o Google Analytics para Firebase, que coleta
identificadores de instalação e eventos de uso, como telas abertas e tempo de
sessão. É a única coleta do projeto que funciona como rastreamento de uso, e
ela acontece apenas no aplicativo.

**O site não usa o Google Analytics.** Nada do que está descrito acima vale
para o navegador.

## Como remover

Você pode limpar o armazenamento local a qualquer momento pelas configurações
do seu navegador. Se fizer isso, será desconectado e perderá o progresso não
concluído do questionário — nada além disso.

No aplicativo, a coleta de uso pode ser interrompida desinstalando o
aplicativo.

## Dúvidas

Escreva para **venussystem2026@gmail.com**.
