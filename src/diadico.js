// Os valores do Hackenbush azul-vermelho sao sempre fracoes DIADICAS: p/2^k.
// Elas sao guardadas como {num, exp}, valendo num / 2^exp, com num inteiro e exp
// minimo. Nada de ponto flutuante: 1/3 nunca aparece, mas 1/1024 aparece, e
// somar 1/1024 mil vezes em double ja erraria.

export function diadico(num, exp = 0) {
  let n = BigInt(num);
  let e = exp;
  while (e > 0 && n % 2n === 0n) {
    n /= 2n;
    e--;
  }
  return { num: n, exp: e };
}

export const ZERO = diadico(0);
export const UM = diadico(1);

export function soma(a, b) {
  const e = Math.max(a.exp, b.exp);
  return diadico(a.num * 2n ** BigInt(e - a.exp) + b.num * 2n ** BigInt(e - b.exp), e);
}

export function negativo(a) {
  return diadico(-a.num, a.exp);
}

export function subtrai(a, b) {
  return soma(a, negativo(b));
}

/** Compara a com b: -1, 0 ou 1. Exato, sem arredondamento. */
export function compara(a, b) {
  const e = Math.max(a.exp, b.exp);
  const x = a.num * 2n ** BigInt(e - a.exp);
  const y = b.num * 2n ** BigInt(e - b.exp);
  return x < y ? -1 : x > y ? 1 : 0;
}

export function igual(a, b) {
  return compara(a, b) === 0;
}

export function texto(a) {
  if (a.exp === 0) return a.num.toString();
  return `${a.num}/${2n ** BigInt(a.exp)}`;
}

/** Para comparar com a literatura e com o olho; nao e usado em conta nenhuma. */
export function paraNumero(a) {
  return Number(a.num) / 2 ** a.exp;
}

/**
 * O numero mais SIMPLES estritamente entre a e b, na ordem em que a teoria dos
 * jogos usa a palavra: o de menor expoente, e entre esses o de menor modulo.
 *
 * E esta funcao que faz o valor de um jogo aparecer. Se existe inteiro no
 * intervalo, o mais proximo de zero entre eles ganha; senao desce para as metades,
 * depois os quartos, e assim por diante. O primeiro que cabe e a resposta.
 */
/** Divisao inteira para baixo, correta tambem com numerador negativo. */
export function divChao(p, q) {
  const r = p / q;
  return p % q !== 0n && p < 0n !== q < 0n ? r - 1n : r;
}

/** Divisao inteira para cima. */
export function divTeto(p, q) {
  const r = p / q;
  return p % q !== 0n && p < 0n === q < 0n ? r + 1n : r;
}

export function maisSimplesEntre(a, b) {
  // Sobe o denominador de 1 em diante. O PRIMEIRO expoente em que cabe algum
  // diadico no intervalo aberto da a resposta, e entre os que cabem vale o de
  // menor modulo. Nao ha busca linear: os extremos saem de duas divisoes.
  for (let exp = 0; exp <= 64; exp++) {
    const D = 2n ** BigInt(exp);

    // menor numerador estritamente maior que a
    const lo = a === null ? null : divChao(a.num * D, 2n ** BigInt(a.exp)) + 1n;
    // maior numerador estritamente menor que b
    const hi = b === null ? null : divTeto(b.num * D, 2n ** BigInt(b.exp)) - 1n;

    if (lo !== null && hi !== null && lo > hi) continue;

    let escolhido;
    if ((lo === null || lo <= 0n) && (hi === null || hi >= 0n)) escolhido = 0n;
    else if (lo !== null && lo > 0n) escolhido = lo;
    else escolhido = hi;

    return diadico(escolhido, exp);
  }
  throw new Error('nao achei numero simples no intervalo');
}
