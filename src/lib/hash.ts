/**
 * Tiny, deterministic 32-bit string hash. We don't need crypto strength —
 * we just need "given the same inputs, always return the same number, with
 * uniform distribution across the mod space". FNV-1a fits perfectly and
 * works in both Node and the Edge runtime.
 */
export function fnv1a32(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  // Coerce to unsigned 32-bit
  return h >>> 0;
}

/** Stable bucket for a (contact, day) pair — used as the seed for the picker. */
export function dayBucket(seed: string, dayIndex: number, modulo: number): number {
  return fnv1a32(`${seed}|${dayIndex}`) % modulo;
}
