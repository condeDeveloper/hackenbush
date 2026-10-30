// Hackenbush azul-vermelho num TALO: uma fileira de arestas empilhadas no chao.
// A string vai de BAIXO para cima: 'L' e uma aresta azul (da Esquerda) e 'R' e
// vermelha (da Direita).
//
// Quem joga corta uma aresta da sua cor, e tudo que ficou pendurado acima dela
// cai junto. Em um talo isso quer dizer: cortar na posicao i deixa o prefixo de
// tamanho i.
//
// Quem nao tem jogada perde. O valor do jogo diz quem ganha: positivo e vitoria
// da Esquerda, negativo da Direita, zero e vitoria de quem joga por ultimo.

import { ZERO, maisSimplesEntre, compara } from './diadico.js';

/** Os talos que a Esquerda pode deixar: cortar um 'L' deixa o prefixo. */
export function jogadasDaEsquerda(talo) {
  const saida = [];
  for (let i = 0; i < talo.length; i++) if (talo[i] === 'L') saida.push(talo.slice(0, i));
  return saida;
}

export function jogadasDaDireita(talo) {
  const saida = [];
  for (let i = 0; i < talo.length; i++) if (talo[i] === 'R') saida.push(talo.slice(0, i));
  return saida;
}

/**
 * Caminho 1: o valor pela definicao recursiva. O jogo vale o numero mais simples
 * estritamente entre o melhor que a Esquerda alcanca e o melhor da Direita.
 * Nenhuma formula entra aqui.
 */
const memoria = new Map();
export function valorRecursivo(talo) {
  if (talo.length === 0) return ZERO;
  if (memoria.has(talo)) return memoria.get(talo);

  const esquerda = jogadasDaEsquerda(talo).map(valorRecursivo);
  const direita = jogadasDaDireita(talo).map(valorRecursivo);

  const melhorEsquerda = esquerda.length === 0 ? null : esquerda.reduce((a, b) => (compara(b, a) > 0 ? b : a));
  const melhorDireita = direita.length === 0 ? null : direita.reduce((a, b) => (compara(b, a) < 0 ? b : a));

  const v = maisSimplesEntre(melhorEsquerda, melhorDireita);
  memoria.set(talo, v);
  return v;
}

/** Quantos talos distintos a recursao ja visitou: a medida do custo. */
export function tamanhoDaMemoria() {
  return memoria.size;
}

export function limparMemoria() {
  memoria.clear();
}

/** Quem ganha o talo, pelo sinal do valor. */
export function vencedor(valor) {
  const s = compara(valor, ZERO);
  if (s > 0) return 'Esquerda';
  if (s < 0) return 'Direita';
  return 'o segundo a jogar';
}

/**
 * Joga a partida de verdade, sem olhar valor nenhum: busca completa de quem tem
 * estrategia vencedora comecando a Esquerda. Serve de terceiro juiz para o sinal.
 */
export function esquerdaGanhaComecando(talo) {
  for (const t of jogadasDaEsquerda(talo)) {
    if (!direitaGanhaComecando(t)) return true;
  }
  return false;
}

export function direitaGanhaComecando(talo) {
  for (const t of jogadasDaDireita(talo)) {
    if (!esquerdaGanhaComecando(t)) return true;
  }
  return false;
}

/** Todos os talos de comprimento n, nas duas cores. */
export function* talos(n) {
  for (let m = 0; m < 1 << n; m++) {
    let s = '';
    for (let i = 0; i < n; i++) s += (m >> i) & 1 ? 'R' : 'L';
    yield s;
  }
}
