import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { AppContext } from '../context.js';
import { guarded, nowIsoDate, successResult } from '../toolRuntime.js';

export function registerGlossaryLookupTool(server: McpServer, context: AppContext): void {
  server.registerTool(
    'glossary_lookup',
    {
      title: 'Glossary Lookup',
      description:
        'Lookup glossary terms by term text and/or category using the configured glossary dataset.',
      inputSchema: {
        term: z.string().optional(),
        category: z.string().optional(),
        limit: z.number().int().min(1).max(100).optional(),
      },
    },
    async ({ term, category, limit }) =>
      guarded(context.limiter, 'glossary_lookup', async () => {
        const results = context.store.getGlossary({ term, category, limit });
        return successResult(
          {
            tool: 'glossary_lookup',
            coverage_status: 'full',
            confidence: 0.95,
            confidence_reason: 'Directly sourced from configured glossary dataset.',
            last_verified_at: nowIsoDate(),
            source: 'configured dataDir/glossary.json',
          },
          {
            query: { term: term ?? null, category: category ?? null, limit: limit ?? 25 },
            categories_available: context.store.listGlossaryCategories(),
            total_matches: results.length,
            results,
          },
        );
      }),
  );
}
