import test from 'node:test';
import assert from 'node:assert/strict';
import {
  diadico, soma, negativo, subtrai, compara, igual, texto, paraNumero,
  maisSimplesEntre, divChao, divTeto, ZERO, UM,
} from '../src/diadico.js';

test('o diadico reduz a fracao', () => {
  assert.deepEqual(diadico(2, 1), { num: 1n, exp: 0 });
  assert.deepEqual(diadico(4, 2), { num: 1n, exp: 0 });
  assert.deepEqual(diadico(6, 2), { num: 3n, exp: 1 });
});

test('zero reduz para expoente zero', () => {
  assert.deepEqual(diadico(0, 5), { num: 0n, exp: 0 });
});

test('soma de metades da um', () => {
  assert.ok(igual(soma(diadico(1, 1), diadico(1, 1)), UM));
});

test('soma com expoentes diferentes', () => {
  // 1/2 + 1/4 = 3/4
  assert.equal(texto(soma(diadico(1, 1), diadico(1, 2))), '3/4');
});

test('somar e subtrair o mesmo volta ao comeco', () => {
  const a = diadico(7, 3);
  const b = diadico(5, 4);
  assert.ok(igual(subtrai(soma(a, b), b), a));
});

test('o negativo troca o sinal e nada mais', () => {
  assert.equal(texto(negativo(diadico(3, 2))), '-3/4');
  assert.ok(igual(negativo(negativo(diadico(3, 2))), diadico(3, 2)));
});

test('comparar e exato mesmo com expoentes distantes', () => {
  // 1/1024 e maior que zero, e menor que 1/512
  assert.equal(compara(diadico(1, 10), ZERO), 1);
  assert.equal(compara(diadico(1, 10), diadico(1, 9)), -1);
});

test('mil somas de 1/1024 sao exatas, e em double tambem', () => {
  // toda fracao diadica cabe exata num double, entao aqui os dois concordam:
  // o BigInt nao esta aqui por causa de arredondamento de fracao
  let x = ZERO;
  for (let i = 0; i < 1000; i++) x = soma(x, diadico(1, 10));
  assert.equal(texto(x), '125/128');
  let d = 0;
  for (let i = 0; i < 1000; i++) d += 1 / 1024;
  assert.equal(d, 1000 / 1024);
});

test('o BigInt esta aqui pelo ESTOURO, nao pelo arredondamento', () => {
  // o talo alternado de 60 arestas tem numerador que passa de 2^53: o double
  // guarda 384307168202282304 onde o valor e 384307168202282325, errando por 21
  const num = 384307168202282325n;
  assert.ok(num > 2n ** 53n);
  assert.equal(BigInt(Number(num)), 384307168202282304n);
  assert.notEqual(BigInt(Number(num)), num);
  assert.equal(num - BigInt(Number(num)), 21n);
});

test('texto imprime inteiro sem denominador', () => {
  assert.equal(texto(diadico(3)), '3');
  assert.equal(texto(diadico(-2)), '-2');
});

test('paraNumero so serve de conferencia', () => {
  assert.equal(paraNumero(diadico(3, 2)), 0.75);
  assert.equal(paraNumero(diadico(-1, 1)), -0.5);
});

test('divisao para baixo e para cima com negativos', () => {
  assert.equal(divChao(7n, 2n), 3n);
  assert.equal(divChao(-7n, 2n), -4n);
  assert.equal(divTeto(7n, 2n), 4n);
  assert.equal(divTeto(-7n, 2n), -3n);
});

test('divisao exata nao muda com chao nem teto', () => {
  assert.equal(divChao(8n, 2n), 4n);
  assert.equal(divTeto(8n, 2n), 4n);
  assert.equal(divChao(-8n, 2n), -4n);
  assert.equal(divTeto(-8n, 2n), -4n);
});

test('o mais simples entre negativo e positivo e zero', () => {
  assert.ok(igual(maisSimplesEntre(diadico(-1), diadico(1)), ZERO));
  assert.ok(igual(maisSimplesEntre(diadico(-5), diadico(3)), ZERO));
});

test('o mais simples a direita de zero e um', () => {
  assert.ok(igual(maisSimplesEntre(ZERO, null), UM));
});

test('o mais simples a esquerda de zero e menos um', () => {
  assert.ok(igual(maisSimplesEntre(null, ZERO), diadico(-1)));
});

test('entre 0 e 1 o mais simples e 1/2', () => {
  assert.equal(texto(maisSimplesEntre(ZERO, UM)), '1/2');
});

test('entre 1/2 e 1 o mais simples e 3/4', () => {
  assert.equal(texto(maisSimplesEntre(diadico(1, 1), UM)), '3/4');
});

test('entre 0 e 1/2 o mais simples e 1/4', () => {
  assert.equal(texto(maisSimplesEntre(ZERO, diadico(1, 1))), '1/4');
});

test('entre 1 e 3 o mais simples e 2, nao 3/2', () => {
  assert.equal(texto(maisSimplesEntre(UM, diadico(3))), '2');
});

test('sem limite de nenhum lado, o mais simples e zero', () => {
  assert.ok(igual(maisSimplesEntre(null, null), ZERO));
});

test('o mais simples fica mesmo dentro do intervalo aberto', () => {
  const casos = [[diadico(0), diadico(1)], [diadico(1, 1), diadico(3, 2)],
    [diadico(-3), diadico(-1)], [diadico(5, 3), diadico(7, 3)]];
  for (const [a, b] of casos) {
    const m = maisSimplesEntre(a, b);
    assert.equal(compara(m, a), 1, `${texto(m)} nao passa de ${texto(a)}`);
    assert.equal(compara(m, b), -1, `${texto(m)} nao fica abaixo de ${texto(b)}`);
  }
});

test('o mais simples tem o menor expoente possivel', () => {
  // entre 1/4 e 3/4 cabe 1/2, de expoente 1, e nao 3/8, de expoente 3
  const m = maisSimplesEntre(diadico(1, 2), diadico(3, 2));
  assert.equal(m.exp, 1);
  assert.equal(texto(m), '1/2');
});
