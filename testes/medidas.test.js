// Os numeros que aparecem no README, presos aqui. Todos sairam de
// `node ferramentas/medidor.js`; nenhum foi digitado de cabeca.

import test from 'node:test';
import assert from 'node:assert/strict';
import { medir, conferirPelaPartida, ATE, ATE_PARTIDA } from '../ferramentas/medidor.js';
import { valorRecursivo, vencedor } from '../src/jogo.js';
import { texto, paraNumero } from '../src/diadico.js';

test('a varredura vai ate 14 arestas', () => {
  assert.equal(ATE, 14);
  assert.equal(ATE_PARTIDA, 10);
});

for (let n = 0; n <= 14; n++) {
  test(`tabela 1, n=${n}: ${2 ** n} talos, zero divergencia`, () => {
    const r = medir(n);
    assert.equal(r.total, 2 ** n);
    assert.equal(r.divergem, 0);
  });

  test(`tabela 2, n=${n}: os ${2 ** n} talos tem ${2 ** n} valores distintos`, () => {
    const r = medir(n);
    assert.equal(r.distintos, 2 ** n);
    assert.equal(r.distintos, r.total);
  });

  test(`tabela 5, n=${n}: a simetria das cores nunca quebra`, () => {
    assert.equal(medir(n).simetriaQuebrada, 0);
  });
}

test('tabela 3: so o talo vazio vale zero', () => {
  let zeros = 0;
  for (let n = 0; n <= ATE; n++) zeros += medir(n).valemZero;
  assert.equal(zeros, 1);
  assert.equal(medir(0).valemZero, 1);
});

test('tabela 3: de 1 a 14 arestas, nenhum talo vale zero', () => {
  for (let n = 1; n <= ATE; n++) assert.equal(medir(n).valemZero, 0, `n=${n}`);
});

for (let n = 0; n <= 10; n++) {
  test(`tabela 4, n=${n}: o valor acertou o vencedor nas ${2 ** n} partidas`, () => {
    const r = conferirPelaPartida(n);
    assert.equal(r.total, 2 ** n);
    assert.equal(r.erradas, 0);
  });
}

test('tabela 4: 2.047 partidas jogadas de verdade, zero erro', () => {
  let total = 0;
  let erradas = 0;
  for (let n = 0; n <= ATE_PARTIDA; n++) {
    const r = conferirPelaPartida(n);
    total += r.total;
    erradas += r.erradas;
  }
  assert.equal(total, 2047);
  assert.equal(erradas, 0);
});

const exemplos = [
  ['', '0', 0, 'o segundo a jogar'],
  ['L', '1', 1, 'Esquerda'],
  ['R', '-1', -1, 'Direita'],
  ['LR', '1/2', 0.5, 'Esquerda'],
  ['RL', '-1/2', -0.5, 'Direita'],
  ['LRR', '1/4', 0.25, 'Esquerda'],
  ['LLR', '3/2', 1.5, 'Esquerda'],
  ['LRL', '3/4', 0.75, 'Esquerda'],
  ['LRRL', '3/8', 0.375, 'Esquerda'],
  ['LRLRLRLR', '85/128', 0.6640625, 'Esquerda'],
  ['LLLLRRRR', '49/16', 3.0625, 'Esquerda'],
];

for (const [talo, valor, decimal, quem] of exemplos) {
  test(`tabela 6: "${talo || '(vazio)'}" vale ${valor}`, () => {
    const v = valorRecursivo(talo);
    assert.equal(texto(v), valor);
    assert.equal(paraNumero(v), decimal);
    assert.equal(vencedor(v), quem);
  });
}

test('fechamento: 32.767 talos varridos', () => {
  let soma = 0;
  for (let n = 0; n <= ATE; n++) soma += medir(n).total;
  assert.equal(soma, 32767);
  assert.equal(soma, 2 ** 15 - 1);
});

test('fechamento: zero divergencia entre a recursao e Berlekamp', () => {
  let div = 0;
  for (let n = 0; n <= ATE; n++) div += medir(n).divergem;
  assert.equal(div, 0);
});

test('fechamento: zero simetria quebrada', () => {
  let s = 0;
  for (let n = 0; n <= ATE; n++) s += medir(n).simetriaQuebrada;
  assert.equal(s, 0);
});

test('o talo alternado de 8 arestas ja passa de 0,66', () => {
  assert.ok(paraNumero(valorRecursivo('LRLRLRLR')) > 0.66);
  assert.ok(paraNumero(valorRecursivo('LRLRLRLR')) < 2 / 3);
});

test('o talo alternado se aproxima de 2/3 alternando por baixo e por cima', () => {
  const dois_tercos = 2 / 3;
  const acima = paraNumero(valorRecursivo('LRLRLRL'));
  const abaixo = paraNumero(valorRecursivo('LRLRLRLR'));
  assert.ok(acima > dois_tercos, `${acima}`);
  assert.ok(abaixo < dois_tercos, `${abaixo}`);
});
