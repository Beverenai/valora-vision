/**
 * Formats a UUID into a human-readable reference code.
 * e.g. "a1b2c3d4-e5f6-..." → "VC-A1B2-C3D4"
 */
export function formatRefCode(uuid: string): string {
  const clean = uuid.replace(/-/g, "").toUpperCase();
  const part1 = clean.slice(0, 4);
  const part2 = clean.slice(4, 8);
  return `VC-${part1}-${part2}`;
}
