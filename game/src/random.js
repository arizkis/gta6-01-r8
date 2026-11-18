export const scope = 'Repeatable city and actor variation from a numeric seed.';
export function seededRandom(seed = 17) {
  let value = seed >>> 0;
  const next = () => {
    value += 0x6d2b79f5;
    let n = Math.imul(value ^ value >>> 15, 1 | value);
    n ^= n + Math.imul(n ^ n >>> 7, 61 | n);
    return ((n ^ n >>> 14) >>> 0) / 4294967296;
  };
  next.range = (a, b) => a + next() * (b - a);
  next.pick = values => values[Math.floor(next() * values.length)];
  return next;
}
