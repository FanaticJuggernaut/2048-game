# 2048

Uma implementação simples do clássico jogo **2048**, feita com HTML, CSS e JavaScript puro (sem dependências ou build).

## Como jogar

Abra o arquivo [`index.html`](index.html) no navegador. Não é necessário instalar nada ou rodar um servidor.

- **Objetivo:** combine números iguais para chegar ao **2048**.
- **Teclado:** use as setas (`↑ ↓ ← →`) ou `W`, `A`, `S`, `D` para mover as peças.
- **Touch:** deslize o dedo na tela na direção desejada.
- O recorde (`RECORDE`) fica salvo no navegador (`localStorage`) entre partidas.

## Estrutura do projeto

| Arquivo | Descrição |
| --- | --- |
| [`index.html`](index.html) | Estrutura da página e do tabuleiro |
| [`style.css`](style.css) | Estilos visuais das peças, tabuleiro e placar |
| [`script.js`](script.js) | Lógica do jogo: geração de peças, movimentos, pontuação e fim de jogo |
