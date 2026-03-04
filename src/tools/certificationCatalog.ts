import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { AppContext } from '../context.js';
import { buildCertificationCatalog } from '../engines/certificationEngine.js';
import { ToolError } from '../errors/model.js';
import { guarded, nowIsoDate, successResult } from '../toolRuntime.js';

export function registerCertificationCatalogTool(server: McpServer, context: AppContext): void {
  server.registerTool(
    'certification_catalog',
    {
      title: 'Certification Catalog',
      description:
        'Return board-level certification catalog with level-wise syllabus objective breakdown and references.',
      inputSchema: {
        board: z.string().optional(),
        certification_level: z.string().optional(),
      },
    },
    async ({ board, certification_level }) =>
      guarded(context.limiter, 'certification_catalog', async () => {
        const metadata = context.store.listCertificationBoards();
        const summaries = context.store.getCertificationLevelSummaries({
          board,
          certificationLevel: certification_level,
        });
        const hasFilters = Boolean(board || certification_level);
        const catalog = buildCertificationCatalog({
          metadata,
          summaries,
          includeEmptyBoards: !hasFilters,
        });

        if (hasFilters && catalog.boards.length === 0) {
          throw new ToolError('NOT_FOUND', 'No certification catalog entries matched filters', {
            board: board ?? null,
            certification_level: certification_level ?? null,
          });
        }

        return successResult(
          {
            tool: 'certification_catalog',
            coverage_status: 'partial',
            confidence: 0.86,
            confidence_reason:
              'Catalog is generated from configured quiz objective taxonomy and curated board metadata.',
            last_verified_at: nowIsoDate(),
            source: 'configured dataDir/quiz_bank.json + data/curated/certification_boards.json',
          },
          {
            filters: {
              board: board ?? null,
              certification_level: certification_level ?? null,
            },
            catalog,
          },
        );
      }),
  );
}
