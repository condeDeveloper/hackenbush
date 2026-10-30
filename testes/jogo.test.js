import test from 'node:test';
import assert from 'node:assert/strict';
import {
  talos, jogadasDaEsquerda, jogadasDaDireita, valorRecursivo, vencedor,
  esquerdaGanhaComecando, direitaGanhaComecando,
} from '../src/jogo.js';
import { valorPorBerlekamp, trocarCores } from '../src/berlekamp.js';
import { texto, igual, compara, negativo, ZERO, diadico } from '../src/diadico.js';

test('o talo vazio nao tem jogada para ninguem', () => {
  assert.deepEqual(jogadasDaEsquerda(''), []);
  assert.deepEqual(jogadasDaDireita(''), []);
});

test('cortar uma aresta derruba tudo que esta acima', () => {
  assert.deepEqual(jogadasDaEsquerda('LRL'), ['', 'LR']);
  assert.deepEqual(jogadasDaDireita('LRL'), ['L']);
});

test('so a dona da cor corta a aresta', () => {
  assert.deepEqual(jogadasDaEsquerda('RRR'), []);
  assert.deepEqual(jogadasDaDireita('LLL'), []);
});

test('o talo vazio vale zero', () => {
  assert.ok(igual(valorRecursivo(''), ZERO));
});

test('uma aresta azul vale 1 e uma vermelha vale -1', () => {
  assert.equal(texto(valorRecursivo('L')), '1');
  assert.equal(texto(valorRecursivo('R')), '-1');
});

test('n arestas azuis valem n', () => {
  for (let n = 1; n <= 10; n++) {
    assert.equal(texto(valorRecursivo('L'.repeat(n))), String(n), `n=${n}`);
  }
});

test('azul com vermelha em cima vale meio', () => {
  assert.equal(texto(valorRecursivo('LR')), '1/2');
  assert.equal(texto(valorRecursivo('RL')), '-1/2');
});

test('os valores classicos de talos pequenos', () => {
  assert.equal(texto(valorRecursivo('LRR')), '1/4');
  assert.equal(texto(valorRecursivo('LRL')), '3/4');
  assert.equal(texto(valorRecursivo('LLR')), '3/2');
  assert.equal(texto(valorRecursivo('LRRL')), '3/8');
});

test('a recursao e Berlekamp concordam em todo talo ate 12 arestas', () => {
  for (let n = 0; n <= 12; n++) {
    for (const t of talos(n)) {
      assert.ok(igual(valorRecursivo(t), valorPorBerlekamp(t)), `${t}`);
    }
  }
});

test('trocar as cores troca o sinal, ate 10 arestas', () => {
  for (let n = 0; n <= 10; n++) {
    for (const t of talos(n)) {
      assert.ok(igual(valorRecursivo(trocarCores(t)), negativo(valorRecursivo(t))), `${t}`);
    }
  }
});

test('nenhum talo nao vazio vale zero, ate 12 arestas', () => {
  for (let n = 1; n <= 12; n++) {
    for (const t of talos(n)) {
      assert.notEqual(compara(valorRecursivo(t), ZERO), 0, `${t} valeu zero`);
    }
  }
});

test('o sinal do valor e o sinal da primeira aresta', () => {
  for (let n = 1; n <= 10; n++) {
    for (const t of talos(n)) {
      const s = compara(valorRecursivo(t), ZERO);
      assert.equal(s, t[0] === 'L' ? 1 : -1, `${t}`);
    }
  }
});

test('talos diferentes do mesmo tamanho tem valores diferentes', () => {
  for (let n = 0; n <= 12; n++) {
    const vistos = new Set();
    for (const t of talos(n)) {
      const v = texto(valorRecursivo(t));
      assert.equal(vistos.has(v), false, `${t} repetiu o valor ${v}`);
      vistos.add(v);
    }
    assert.equal(vistos.size, 2 ** n, `n=${n}`);
  }
});

test('o valor previu o vencedor em toda partida jogada ate 9 arestas', () => {
  for (let n = 0; n <= 9; n++) {
    for (const t of talos(n)) {
      const quem = vencedor(valorRecursivo(t));
      const esq = esquerdaGanhaComecando(t);
      const dir = direitaGanhaComecando(t);
      if (quem === 'Esquerda') {
        assert.ok(esq && !dir, `${t}: valor diz Esquerda`);
      } else if (quem === 'Direita') {
        assert.ok(!esq && dir, `${t}: valor diz Direita`);
      } else {
        assert.ok(!esq && !dir, `${t}: valor diz segundo jogador`);
      }
    }
  }
});

test('num talo que comeca em azul, a Esquerda ganha mesmo sem comecar', () => {
  for (let n = 1; n <= 9; n++) {
    for (const t of talos(n)) {
      if (t[0] !== 'L') continue;
      assert.equal(direitaGanhaComecando(t), false, `${t}`);
    }
  }
});

test('o talo alternado converge para dois tercos', () => {
  // 2/3 em binario e 0,101010... Nenhum talo FINITO vale 2/3, porque todo valor
  // aqui e diadico; mas a sequencia se aproxima por cima e por baixo
  const dois_tercos = 2 / 3;
  let anterior = null;
  for (let n = 2; n <= 20; n += 2) {
    const v = valorRecursivo('LR'.repeat(n / 2));
    const d = Number(v.num) / 2 ** v.exp;
    assert.ok(Math.abs(d - dois_tercos) < 1, `n=${n}`);
    if (anterior !== null) {
      assert.ok(Math.abs(d - dois_tercos) < Math.abs(anterior - dois_tercos), `n=${n} nao se aproximou`);
    }
    anterior = d;
  }
});

test('nenhum talo finito vale exatamente dois tercos', () => {
  // todo denominador aqui e potencia de dois, e 3 nao divide potencia de dois
  for (let n = 0; n <= 12; n++) {
    for (const t of talos(n)) {
      const v = valorRecursivo(t);
      assert.notEqual(v.num * 3n, 2n * 2n ** BigInt(v.exp), `${t}`);
    }
  }
});

test('LRLRLRLR vale 85/128', () => {
  assert.equal(texto(valorRecursivo('LRLRLRLR')), '85/128');
});

test('LLLLRRRR vale 49/16', () => {
  assert.equal(texto(valorRecursivo('LLLLRRRR')), '49/16');
  assert.ok(compara(valorRecursivo('LLLLRRRR'), diadico(3)) > 0);
});
