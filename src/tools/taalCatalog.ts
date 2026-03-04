import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { AppContext } from '../context.js';
import { ToolError } from '../errors/model.js';
import { guarded, nowIsoDate, successResult } from '../toolRuntime.js';

export function registerTaalCatalogTool(server: McpServer, context: AppContext): void {
  server.registerTool(
    'taal_catalog',
    {
      title: 'Taal Catalog',
      description:
        'Return full taal catalog or one taal entry with matras, vibhag, sam/khali, clap-wave, and counting guidance.',
      inputSchema: {
        taal_id: z.string().optional(),
      },
    },
    async ({ taal_id }) =>
      guarded(context.limiter, 'taal_catalog', async () => {
        if (taal_id) {
          const taal = context.store.getTaalById(taal_id);
          if (!taal) {
            throw new ToolError('NOT_FOUND', `Taal not found: ${taal_id}`);
          }

          return successResult(
            {
              tool: 'taal_catalog',
              coverage_status: 'partial',
              confidence: 0.9,
              confidence_reason: 'Loaded directly from configured talas dataset.',
              last_verified_at: nowIsoDate(),
              source: 'configured dataDir/talas.json',
            },
            {
              mode: 'single',
              taal,
            },
          );
        }

        const taals = context.store.listTaals();
        return successResult(
          {
            tool: 'taal_catalog',
            coverage_status: 'partial',
            confidence: 0.9,
            confidence_reason: 'Loaded directly from configured talas dataset.',
            last_verified_at: nowIsoDate(),
            source: 'configured dataDir/talas.json',
          },
          {
            mode: 'catalog',
            total_taals: taals.length,
            taals,
          },
        );
      }),
  );
}
