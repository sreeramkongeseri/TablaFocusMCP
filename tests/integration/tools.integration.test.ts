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
  it('lists MCP resources', async () => {
    const { server, client } = await createHarness();
    try {
      const result = await client.listResources();
      const uris = result.resources.map((resource) => resource.uri);

      expect(uris).toContain('tabla://glossary');
      expect(uris).toContain('tabla://taals');
      expect(uris).toContain('tabla://certification-boards');
      expect(uris).toContain('tabla://certification-level-summaries');
    } finally {
      await client.close();
      await server.close();
    }
  });

  it('reads glossary MCP resource', async () => {
    const { server, client } = await createHarness();
    try {
      const result = await client.readResource({ uri: 'tabla://glossary' });
      expect(result.contents.length).toBeGreaterThan(0);

      const first = result.contents[0];
      if (!('text' in first)) {
        throw new Error('Expected text content in glossary resource');
      }

      const payload = JSON.parse(first.text) as {
        data: { total_entries: number; entries: unknown[]; categories: string[] };
      };
      expect(payload.data.total_entries).toBeGreaterThan(0);
      expect(payload.data.entries.length).toBeGreaterThan(0);
      expect(payload.data.categories.length).toBeGreaterThan(0);
    } finally {
      await client.close();
      await server.close();
    }
  });

  it('lists MCP prompts', async () => {
    const { server, client } = await createHarness();
    try {
      const result = await client.listPrompts();
      const names = result.prompts.map((prompt) => prompt.name);

      expect(names).toContain('cert_prep_plan');
      expect(names).toContain('weekly_practice_reset');
      expect(names).toContain('exam_week_plan');
      expect(names).toContain('missed_week_recovery');
      expect(names).toContain('composition_polish');
    } finally {
      await client.close();
      await server.close();
    }
  });

  it('gets cert_prep_plan prompt', async () => {
    const { server, client } = await createHarness();
    try {
      const result = await client.getPrompt({
        name: 'cert_prep_plan',
        arguments: {
          board: 'ABGMVM',
          certification_level: 'MADHYAMA_PRATHAM',
          days_per_week: '5',
          minutes_per_day: '45',
        },
      });

      expect(result.messages.length).toBeGreaterThan(0);
      const first = result.messages[0];
      if (first.content.type !== 'text') {
        throw new Error('Expected text content from cert_prep_plan prompt');
      }

      expect(first.content.text).toContain('assessment_builder');
      expect(first.content.text).toContain('practice_coach');
    } finally {
      await client.close();
      await server.close();
    }
  });

  it('gets exam_week_plan prompt', async () => {
    const { server, client } = await createHarness();
    try {
      const result = await client.getPrompt({
        name: 'exam_week_plan',
        arguments: {
          board: 'ABGMVM',
          certification_level: 'MADHYAMA_PRATHAM',
          daily_minutes: '50',
          weak_areas: 'kayda clarity;teental counting',
          fatigue: 'medium',
        },
      });

      expect(result.messages.length).toBeGreaterThan(0);
      const first = result.messages[0];
      if (first.content.type !== 'text') {
        throw new Error('Expected text content from exam_week_plan prompt');
      }

      expect(first.content.text).toContain('certification_catalog');
      expect(first.content.text).toContain('assessment_builder');
      expect(first.content.text).toContain('practice_coach');
    } finally {
      await client.close();
      await server.close();
    }
  });

  it('gets missed_week_recovery prompt', async () => {
    const { server, client } = await createHarness();
    try {
      const result = await client.getPrompt({
        name: 'missed_week_recovery',
        arguments: {
          goals: 'steady pulse;tihai endings',
          daily_minutes: '35',
          days_per_week: '5',
          missed_days: '3',
          completed_minutes: '80',
          fatigue: 'high',
        },
      });

      expect(result.messages.length).toBeGreaterThan(0);
      const first = result.messages[0];
      if (first.content.type !== 'text') {
        throw new Error('Expected text content from missed_week_recovery prompt');
      }

      expect(first.content.text).toContain('practice_coach');
      expect(first.content.text).toContain('assessment_builder');
      expect(first.content.text).toContain('composition_validator');
    } finally {
      await client.close();
      await server.close();
    }
  });

  it('gets composition_polish prompt', async () => {
    const { server, client } = await createHarness();
    try {
      const result = await client.getPrompt({
        name: 'composition_polish',
        arguments: {
          taal: 'teental',
          form: 'tihai',
          jati: 'chatusra',
          cycles: '1',
          polish_rounds: '2',
        },
      });

      expect(result.messages.length).toBeGreaterThan(0);
      const first = result.messages[0];
      if (first.content.type !== 'text') {
        throw new Error('Expected text content from composition_polish prompt');
      }

      expect(first.content.text).toContain('taal_catalog');
      expect(first.content.text).toContain('compose_builder');
      expect(first.content.text).toContain('composition_validator');
    } finally {
      await client.close();
      await server.close();
    }
  });

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

  it('calls compose_builder with alias-tolerant inputs', async () => {
    const { server, client } = await createHarness();
    try {
      const result = await client.callTool({
        name: 'compose_builder',
        arguments: { taal: 'teen taal', form: 'chakra dar', jati: 'chatusra', cycles: 1 },
      });

      expect(result.isError).toBeFalsy();
      const payload = result.structuredContent as {
        data: { request: { resolved_taal_id: string; form: string } };
      };
      expect(payload.data.request.resolved_taal_id).toBe('teental');
      expect(payload.data.request.form).toBe('chakradhar');
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
      const payload = result.structuredContent as {
        data: {
          request: { count: number };
          assessment: {
            answer_key: Array<{
              rationale: {
                correct_reason: string;
                incorrect_reasons: Array<{ reason: string }>;
              };
            }>;
          };
        };
      };
      expect(payload.data.request.count).toBe(10);
      expect(payload.data.assessment.answer_key[0].rationale.correct_reason.length).toBeGreaterThan(0);
      expect(payload.data.assessment.answer_key[0].rationale.incorrect_reasons.length).toBeGreaterThan(
        0,
      );
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
