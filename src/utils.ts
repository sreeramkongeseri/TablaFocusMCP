import crypto from 'node:crypto';

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function normalize(input: string): string {
  return input.trim().toLowerCase();
}

export function parseLevelLabel(levelToken: string): string {
  return levelToken
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function stableShuffle<T>(items: T[], seed = 'tablafocus-mcp'): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const hash = crypto.createHash('sha256').update(`${seed}:${i}`).digest('hex');
    const n = Number.parseInt(hash.slice(0, 8), 16);
    const j = n % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
