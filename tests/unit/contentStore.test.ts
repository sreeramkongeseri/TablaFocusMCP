import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { ContentStore } from '../../src/data/contentStore.js';

describe('contentStore', () => {
  it('loads glossary and taals from bundled data', async () => {
    const store = new ContentStore({
      dataDir: path.resolve(process.cwd(), 'data', 'samples'),
      curatedDataDir: path.resolve(process.cwd(), 'data', 'curated'),
      rateLimitPerMinute: 999,
      deterministic: true,
      logLevel: 'info',
    });

    await store.load();

    const glossary = store.getGlossary({ limit: 10 });
    expect(glossary.length).toBeGreaterThan(0);

    const taals = store.listTaals();
    expect(taals.length).toBeGreaterThan(3);

    const teental = store.getTaalById('teental');
    expect(teental?.matras).toBe(16);
  });
});
