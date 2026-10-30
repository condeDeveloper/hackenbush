#!/usr/bin/env node
// O medidor: roda as varreduras e imprime as tabelas que vao para o README.
// Nenhum numero do README e digitado a mao; todos saem daqui.

import {
  talos, valorRecursivo, esquerdaGanhaComecando, direitaGanhaComecando,
  vencedor, tamanhoDaMemoria,
} from '../src/jogo.js';
import { valorPorBerlekamp, trocarCores } from '../src/berlekamp.js';
import { igual, texto, compara, ZERO, negativo, paraNumero } from '../src/diadico.js';

const br = (x) => x.toLocaleString('pt-BR');

export const ATE = 14;
export const ATE_PARTIDA = 10;

const guardado = new Map();

export function medir(n) {
  if (guardado.has(n)) return guardado.get(n);
  let total = 0;
  let divergem = 0;
  let valemZero = 0;
  let simetriaQuebrada = 0;
  const valores = new Set();
  const exemplos = [];

  for (const t of talos(n)) {
    total++;
    const a = valorRecursivo(t);
    const b = valorPorBerlekamp(t);
    if (!igual(a, b)) {
      divergem++;
      if (exemplos.length < 5) exemplos.push({ talo: t, recursivo: texto(a), berlekamp: texto(b) });
    }
    if (compara(a, ZERO) === 0) valemZero++;
    if (!igual(valorRecursivo(trocarCores(t)), negativo(a))) simetriaQuebrada++;
    valores.add(texto(a));
  }

  const r = { n, total, divergem, valemZero, simetriaQuebrada, distintos: valores.size, exemplos };
  guardado.set(n, r);
  return r;
}

/** O terceiro caminho: jogar a partida inteira e ver quem ganha. */
export function conferirPelaPartida(n) {
  let total = 0;
  let erradas = 0;
  for (const t of talos(n)) {
    total++;
    const v = valorRecursivo(t);
    const quem = vencedor(v);
    const esqComecando = esquerdaGanhaComecando(t);
    const dirComecando = direitaGanhaComecando(t);
    // valor positivo: Esquerda ganha comecando ou nao
    let previsto;
    if (quem === 'Esquerda') previsto = esqComecando && !dirComecando;
    else if (quem === 'Direita') previsto = !esqComecando && dirComecando;
    else previsto = !esqComecando && !dirComecando;
    if (!previsto) erradas++;
  }
  return { n, total, erradas };
}

function imprimir() {
  const ns = [];
  for (let n = 0; n <= ATE; n++) ns.push(n);

  console.log('\n== Tabela 1: a recursao contra a regra de Berlekamp ==');
  console.log('  n | talos | divergencias | valores distintos');
  for (const n of ns) {
    const r = medir(n);
    console.log(
      `  ${String(n).padStart(2)} | ${br(r.total).padStart(6)} | ${String(r.divergem).padStart(12)} | ${br(r.distintos).padStart(17)}`
    );
    if (r.divergem > 0) {
      console.error(`DIVERGENCIA em n=${n}: ${JSON.stringify(r.exemplos)}`);
      process.exit(1);
    }
  }

  console.log('\n== Tabela 2: todo talo de comprimento n tem valor diferente? ==');
  console.log('  n | talos | valores distintos | repetem?');
  for (const n of ns) {
    const r = medir(n);
    console.log(
      `  ${String(n).padStart(2)} | ${br(r.total).padStart(6)} | ${br(r.distintos).padStart(17)} | ${r.distintos === r.total ? 'nao' : 'SIM'}`
    );
  }

  console.log('\n== Tabela 3: algum talo vale zero? ==');
  console.log('  Valor zero quer dizer que quem joga primeiro PERDE.');
  console.log('  n | talos | valem zero');
  let zerosTotais = 0;
  for (const n of ns) {
    const r = medir(n);
    zerosTotais += r.valemZero;
    console.log(`  ${String(n).padStart(2)} | ${br(r.total).padStart(6)} | ${r.valemZero}`);
  }
  console.log(`  no total, fora o talo vazio: ${zerosTotais - 1}`);

  console.log('\n== Tabela 4: o valor previu o vencedor da partida de verdade? ==');
  console.log('  A partida e jogada inteira, sem olhar valor nenhum.');
  console.log('  n | talos | previsoes erradas');
  for (let n = 0; n <= ATE_PARTIDA; n++) {
    const r = conferirPelaPartida(n);
    console.log(`  ${String(n).padStart(2)} | ${br(r.total).padStart(6)} | ${r.erradas}`);
    if (r.erradas > 0) {
      console.error(`O VALOR ERROU O VENCEDOR em n=${n}`);
      process.exit(1);
    }
  }

  console.log('\n== Tabela 5: trocar as cores troca o sinal? ==');
  console.log('  n | talos | simetria quebrada');
  for (const n of ns) {
    const r = medir(n);
    console.log(`  ${String(n).padStart(2)} | ${br(r.total).padStart(6)} | ${r.simetriaQuebrada}`);
    if (r.simetriaQuebrada > 0) process.exit(1);
  }

  console.log('\n== Tabela 6: alguns talos e seus valores ==');
  console.log('  talo        | valor | em decimal | quem ganha');
  for (const t of ['', 'L', 'R', 'LR', 'RL', 'LRR', 'LLR', 'LRL', 'LRRL', 'LRLRLRLR', 'LLLLRRRR']) {
    const v = valorRecursivo(t);
    console.log(
      `  ${(t || '(vazio)').padEnd(11)} | ${texto(v).padStart(5)} | ${String(paraNumero(v)).padStart(10)} | ${vencedor(v)}`
    );
  }

  console.log('\n== Fechamento ==');
  const soma = ns.reduce((a, n) => a + medir(n).total, 0);
  const div = ns.reduce((a, n) => a + medir(n).divergem, 0);
  const sim = ns.reduce((a, n) => a + medir(n).simetriaQuebrada, 0);
  console.log(`  talos varridos .................... ${br(soma)}`);
  console.log(`  divergencias recursao x Berlekamp . ${div}`);
  console.log(`  simetrias quebradas ............... ${sim}`);
  console.log(`  talos nao vazios valendo zero ..... ${zerosTotais - 1}`);
  console.log(`  posicoes guardadas pela recursao .. ${br(tamanhoDaMemoria())}`);
  console.log('');
  if (div > 0 || sim > 0) process.exit(1);
}

if (process.argv[1]?.endsWith('medidor.js')) imprimir();
