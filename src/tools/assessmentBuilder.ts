import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { AppContext } from '../context.js';
import { AssessmentMode, buildAssessment } from '../engines/assessmentEngine.js';
import { ToolError } from '../errors/model.js';
import { guarded, nowIsoDate, successResult } from '../toolRuntime.js';
import { normalize } from '../utils.js';

const modeSchema = z.enum(['practice_quiz', 'cert_mock']);

export function registerAssessmentBuilderTool(server: McpServer, context: AppContext): void {
  server.registerTool(
    'assessment_builder',
    {
      title: 'Assessment Builder',
      description:
        'Build practice quiz or certification-style mock from the configured quiz bank with answer key and rubric.',
      inputSchema: {
        mode: modeSchema,
        board: z.string().optional(),
        certification_level: z.string().optional(),
        taal: z.string().optional(),
        count: z.number().int().min(1).max(100).default(10),
        seed: z.string().optional(),
      },
    },
    async ({ mode, board, certification_level, taal, count, seed }) =>
      guarded(context.limiter, 'assessment_builder', async () => {
        const isCertMock = mode === 'cert_mock';
        if (isCertMock && (!board || !certification_level)) {
          throw new ToolError(
            'INVALID_INPUT',
            'cert_mock mode requires both board and certification_level',
          );
        }

        const filtered = context.store.getQuestions({
          board,
          certificationLevel: certification_level,
          taal,
        });

        if (filtered.length === 0) {
          throw new ToolError(
            'NOT_FOUND',
            'No questions found for the requested assessment filters',
            {
              mode,
              board,
              certification_level,
              taal,
            },
          );
        }

        const assessment = buildAssessment({
          mode: mode as AssessmentMode,
          count,
          questions: filtered,
          seed,
        });

        const boardMeta = board
          ? context.store
              .listCertificationBoards()
              .find((item) => normalize(item.board) === normalize(board))
          : null;

        const summary = isCertMock
          ? (context.store.getCertificationLevelSummaries({
              board,
              certificationLevel: certification_level,
            })[0] ?? null)
          : null;

        return successResult(
          {
            tool: 'assessment_builder',
            coverage_status: 'partial',
            confidence: 0.9,
            confidence_reason:
              'Questions come from configured quiz dataset, with deterministic selection and objective mapping.',
            last_verified_at: nowIsoDate(),
            source: 'configured dataDir/quiz_bank.json',
          },
          {
            request: {
              mode,
              board: board ?? null,
              certification_level: certification_level ?? null,
              taal: taal ?? null,
              count,
              seed: seed ?? null,
            },
            assessment,
            certification_reference:
              isCertMock && boardMeta && summary
                ? {
                    board: boardMeta.board,
                    board_name: boardMeta.fullName,
                    level: summary.certification_level,
                    level_label: summary.level_label,
                    references: boardMeta.references,
                    objective_count: summary.objectives.length,
                  }
                : null,
          },
        );
      }),
  );
}
