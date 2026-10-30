# Hackenbush azul-vermelho: quanto vale uma posição

Dois jogadores, um desenho pendurado no chão. A Esquerda corta arestas azuis, a
Direita corta vermelhas, e tudo que ficar solto cai junto. Quem não tem jogada
perde.

A teoria dos jogos combinatórios diz que cada posição tem um **valor numérico**, e
que esse número decide a partida antes dela começar. Aqui o valor é calculado por
dois caminhos que não se falam — a **recursão da definição** e a **regra de
Berlekamp** — e conferido por um terceiro: jogar a partida inteira. Node puro, sem
dependência nenhuma.

Um talo é uma fileira de arestas, escrita de baixo para cima:

```
LR    azul embaixo, vermelha em cima    vale 1/2
LRR                                     vale 1/4
LRRL                                    vale 3/8
```

## Os quatro achados

1. **A recursão e a regra de Berlekamp concordam nos 32.767 talos varridos.** São
   todos os talos de 0 a 14 arestas. A recursão não conhece a regra, e a regra não
   sabe o que é uma jogada.
2. **Os 2ⁿ talos de n arestas têm 2ⁿ valores diferentes — uma bijeção perfeita, em
   todos os quinze comprimentos.** Nenhum par de talos do mesmo tamanho jamais
   vale o mesmo.
3. **Nenhum talo não vazio vale zero.** Em 32.766 posições, o segundo jogador
   nunca ganha: quem é dono da aresta de baixo ganha a partida, jogando primeiro
   ou não. O sinal do valor é sempre o da primeira aresta.
4. **O talo alternado converge para 2/3, que nenhum talo finito atinge.** `LRLRLR`
   vai chegando por cima e por baixo — 85/128 em 8 arestas — mas todo valor finito
   é uma fração diádica, e 3 não divide potência de 2.

## As tabelas

Tudo abaixo sai de `node ferramentas/medidor.js`, e está preso em
`testes/medidas.test.js`.

### A recursão contra a regra de Berlekamp

| n | talos | divergências | valores distintos |
|---|---|---|---|
| 8 | 256 | 0 | 256 |
| 10 | 1.024 | 0 | 1.024 |
| 12 | 4.096 | 0 | 4.096 |
| 13 | 8.192 | 0 | 8.192 |
| 14 | 16.384 | 0 | 16.384 |

### O valor previu o vencedor da partida de verdade?

A partida é jogada inteira, por busca completa, sem olhar valor nenhum.

| n | talos | previsões erradas |
|---|---|---|
| 8 | 256 | 0 |
| 9 | 512 | 0 |
| 10 | 1.024 | 0 |

**2.047 partidas, zero erro.**

### Alguns talos e seus valores

| talo | valor | em decimal | quem ganha |
|---|---|---|---|
| (vazio) | 0 | 0 | o segundo a jogar |
| L | 1 | 1 | Esquerda |
| R | -1 | -1 | Direita |
| LR | 1/2 | 0,5 | Esquerda |
| RL | -1/2 | -0,5 | Direita |
| LRR | 1/4 | 0,25 | Esquerda |
| LLR | 3/2 | 1,5 | Esquerda |
| LRL | 3/4 | 0,75 | Esquerda |
| LRRL | 3/8 | 0,375 | Esquerda |
| LRLRLRLR | 85/128 | 0,6640625 | Esquerda |
| LLLLRRRR | 49/16 | 3,0625 | Esquerda |

### Algum talo vale zero?

| n | talos | valem zero |
|---|---|---|
| 0 | 1 | 1 |
| 1 a 14 | 32.766 | **0** |

## O que as medidas me corrigiram

- **Escrevi um teste dizendo que somar 1/1024 mil vezes em `double` erraria. Não
  erra.** Toda fração diádica cabe exata num `double`, e as somas parciais também:
  é justamente o tipo de fração que o ponto flutuante representa sem perda. O
  `BigInt` deste projeto não está aqui por arredondamento.
- **Ele está aqui pelo estouro, e eu só descobri onde indo medir.** O talo
  alternado de **56 arestas** já tem numerador maior que 2⁵³; no de 60, o valor é
  384.307.168.202.282.325 e o `double` guarda 384.307.168.202.282.304 — erra por
  21. Esse virou o teste, com o número que eu medi, não o que eu supunha.
- **A primeira versão da regra da simplicidade saía com `RangeError`.** Eu
  escalava os expoentes com `BigInt(exp - a.exp)`, que estoura quando o limite tem
  expoente maior que o candidato — e o expoente negativo só aparece em parte dos
  intervalos, então os casos pequenos passavam. Troquei a busca linear por duas
  divisões inteiras, com chão e teto corretos para numerador negativo.

## Como está organizado

```
src/diadico.js    as frações p/2^k em BigInt, e a regra do número mais simples
src/jogo.js       as jogadas, o valor pela definição recursiva, e a partida jogada
src/berlekamp.js  o valor lido direto do talo, como se fosse um número binário
ferramentas/medidor.js  roda as varreduras e imprime as tabelas acima
testes/           118 testes
```

A regra do **número mais simples** é o coração: o valor de uma posição é o número
de menor expoente que cabe estritamente entre o melhor que a Esquerda alcança e o
melhor que a Direita alcança. É ela que faz um jogo virar uma fração.

## Rodar

```bash
node --test testes/*.test.js   # a bateria inteira
node ferramentas/medidor.js    # recalcula todas as tabelas deste README
```

Sem `npm install`: não há dependência. Precisa de Node 18 ou mais novo.

## Licença

MIT.
