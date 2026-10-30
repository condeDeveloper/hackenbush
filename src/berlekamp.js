// Caminho 2: a regra de Berlekamp. Ela le o talo como se fosse um numero escrito
// em binario, e devolve o valor sem jogar nada.
//
//   - o bloco inicial de arestas da mesma cor vale a contagem delas, com sinal
//   - a PRIMEIRA aresta de cor diferente e descartada; dali em diante cada
//     aresta vale metade da anterior, comecando em 1/2, somando se for azul e
//     subtraindo se for vermelha
//
// Nada aqui sabe o que e uma jogada. Se os dois caminhos derem o mesmo numero em
// todo talo varrido, e porque os dois estao certos.

import { diadico, soma, negativo, ZERO } from './diadico.js';

export function valorPorBerlekamp(talo) {
  if (talo.length === 0) return ZERO;

  const primeira = talo[0];
  const sinal = primeira === 'L' ? 1n : -1n;

  // o bloco inicial da mesma cor
  let i = 0;
  while (i < talo.length && talo[i] === primeira) i++;
  let valor = diadico(sinal * BigInt(i));

  // a primeira aresta diferente so marca onde a parte fracionaria comeca
  if (i < talo.length) {
    i++;
    let exp = 1;
    // a parte fracionaria ja comeca descontando meia unidade do lado contrario
    valor = soma(valor, diadico(-sinal, exp));
    for (; i < talo.length; i++) {
      exp++;
      const passo = diadico(talo[i] === 'L' ? 1n : -1n, exp);
      valor = soma(valor, passo);
    }
  }
  return valor;
}

/** O negativo de um talo e o mesmo talo com as cores trocadas. */
export function trocarCores(talo) {
  let s = '';
  for (const c of talo) s += c === 'L' ? 'R' : 'L';
  return s;
}

/** Confere a simetria: trocar as cores tem de trocar o sinal do valor. */
export function simetrico(talo, valorDe) {
  return negativo(valorDe(talo));
}
