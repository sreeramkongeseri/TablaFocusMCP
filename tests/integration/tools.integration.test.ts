import path from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { describe, expect, it } from 'vitest';
import { AppContext } from '../../src/context.js';
import { ContentStore } from '../../src/data/contentStore.js';
import { RateLimiter } from '../../src/rateLimiter.js';
import { buildServer } from '../../src/server.js';

async function createHarness() {
  const store = new ContentStore({
    dataDir: path.resolve(process.cwd(), 'data', 'samples'),
    curatedDataDir: path.resolve(process.cwd(), 'data', 'curated'),
    rateLimitPerMinute: 999,
    deterministic: true,
    logLevel: 'info',
  });
  await store.load();

  const context: AppContext = {
    store,
    limiter: new RateLimiter(999),
  };

  const server = buildServer(context);
  const client = new Client({ name: 'test-client', version: '0.1.0' });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

  return { server, client };
}

describe('tool integration', () => {
  it('calls glossary_lookup', async () => {
    const { server, client } = await createHarness();
    try {
      const result = await client.callTool({
        name: 'glossary_lookup',
        arguments: { term: 'sam', limit: 3 },
      });

      expect(result.isError).toBeFalsy();
      expect(result.structuredContent).toBeTruthy();
    } finally {
      await client.close();
      await server.close();
    }
  });

  it('calls compose_builder', async () => {
    const { server, client } = await createHarness();
    try {
      const result = await client.callTool({
        name: 'compose_builder',
        arguments: { taal: 'teental', form: 'tihai', jati: 'chatusra', cycles: 1 },
      });

      expect(result.isError).toBeFalsy();
      expect(result.structuredContent).toBeTruthy();
    } finally {
      await client.close();
      await server.close();
    }
  });

  it('calls explain_taal compatibility alias', async () => {
    const { server, client } = await createHarness();
    try {
      const result = await client.callTool({
        name: 'explain_taal',
        arguments: { taal: 'teental' },
      });

      expect(result.isError).toBeFalsy();
      expect(result.structuredContent).toBeTruthy();
    } finally {
      await client.close();
      await server.close();
    }
  });

  it('calls assessment_builder with default count', async () => {
    const { server, client } = await createHarness();
    try {
      const result = await client.callTool({
        name: 'assessment_builder',
        arguments: { mode: 'practice_quiz' },
      });

      expect(result.isError).toBeFalsy();
      const payload = result.structuredContent as { data: { request: { count: number } } };
      expect(payload.data.request.count).toBe(10);
    } finally {
      await client.close();
      await server.close();
    }
  });

  it('filters certification_catalog by board without leaking empty boards', async () => {
    const { server, client } = await createHarness();
    try {
      const result = await client.callTool({
        name: 'certification_catalog',
        arguments: { board: 'ABGMVM' },
      });

      expect(result.isError).toBeFalsy();
      const payload = result.structuredContent as {
        data: { catalog: { boards: Array<{ board: string; levels: unknown[] }> } };
      };
      expect(payload.data.catalog.boards.length).toBeGreaterThan(0);
      expect(payload.data.catalog.boards.every((entry) => entry.board === 'ABGMVM')).toBe(true);
      expect(payload.data.catalog.boards.every((entry) => entry.levels.length > 0)).toBe(true);
    } finally {
      await client.close();
      await server.close();
    }
  });
});
