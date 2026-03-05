import crypto from 'node:crypto';

const TAAL_LOOKUP_ALIASES: Record<string, string> = {
  teentaal: 'teental',
  tintal: 'teental',
  tintaal: 'teental',
  trital: 'teental',
  tritaal: 'teental',
  jhaptal: 'jhaptaal',
  jhaptaal: 'jhaptaal',
  jhaptaal10: 'jhaptaal',
  ektal: 'ektaal',
  ektaal: 'ektaal',
  keharwa: 'keherwa',
  kaherwa: 'keherwa',
  kaharwa: 'keherwa',
};

const TAAL_LOOKUP_REVERSE_ALIASES = Object.entries(TAAL_LOOKUP_ALIASES).reduce<
  Record<string, string[]>
>((acc, [alias, canonical]) => {
  const existing = acc[canonical] ?? [];
  existing.push(alias);
  acc[canonical] = existing;
  return acc;
}, {});

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

export function toCompactLookupKey(input: string): string {
  return input
    .toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/[^a-z0-9]+/g, '');
}

export function normalizeTaalLookupKey(input: string): string {
  const key = toCompactLookupKey(input);
  return TAAL_LOOKUP_ALIASES[key] ?? key;
}

export function expandTaalLookupKeys(input: string): string[] {
  const expanded = new Set<string>();
  const queue: string[] = [normalizeTaalLookupKey(input)];

  while (queue.length > 0) {
    const key = queue.shift();
    if (!key || expanded.has(key)) {
      continue;
    }
    expanded.add(key);

    const canonical = TAAL_LOOKUP_ALIASES[key];
    if (canonical && !expanded.has(canonical)) {
      queue.push(canonical);
    }

    const reverseAliases = TAAL_LOOKUP_REVERSE_ALIASES[key] ?? [];
    for (const alias of reverseAliases) {
      if (!expanded.has(alias)) {
        queue.push(alias);
      }
    }

    if (key.endsWith('tal')) {
      const taalVariant = `${key.slice(0, -3)}taal`;
      if (!expanded.has(taalVariant)) {
        queue.push(taalVariant);
      }
    } else if (key.endsWith('taal')) {
      const talVariant = `${key.slice(0, -4)}tal`;
      if (!expanded.has(talVariant)) {
        queue.push(talVariant);
      }
    }
  }

  return [...expanded];
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
