import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { AppContext } from '../context.js';
import {
  CompositionBuildResult,
  buildComposition,
  normalizeCompositionForm,
} from '../engines/compositionRuleEngine.js';
import { ToolError } from '../errors/model.js';
import { Jati } from '../types.js';
import { guarded, nowIsoDate, successResult } from '../toolRuntime.js';

const formSchema = z.string().min(1);
const jatiSchema = z.enum(['tisra', 'chatusra', 'khanda', 'misra']);

export function registerComposeBuilderTool(server: McpServer, context: AppContext): void {
  server.registerTool(
    'compose_builder',
    {
      title: 'Compose Builder',
      description:
        'Build mathematically valid tihai, tukra, or chakradhar compositions for a given taal and jati.',
      inputSchema: {
        taal: z.string().min(1),
        form: formSchema,
        jati: jatiSchema,
        cycles: z.number().int().min(1).max(12).optional(),
      },
    },
    async ({ taal, form, jati, cycles }) =>
      guarded(context.limiter, 'compose_builder', async () => {
        const resolvedForm = normalizeCompositionForm(form);
        const taalEntry = context.store.getTaalById(taal);

        if (!taalEntry) {
          throw new ToolError('NOT_FOUND', `Taal not found: ${taal}`);
        }

        const attempts = cycles ? [cycles] : Array.from({ length: 12 }, (_, i) => i + 1);
        const candidates: CompositionBuildResult[] = [];

        for (const attemptCycles of attempts) {
          try {
            const result = buildComposition({
              matras: taalEntry.matras,
              form: resolvedForm,
              jati: jati as Jati,
              cycles: attemptCycles,
            });
            candidates.push(result);
          } catch {
            // continue
          }
        }

        if (candidates.length === 0) {
          throw new ToolError(
            'VALIDATION_FAILED',
            'No valid composition could be built with requested inputs',
          );
        }

        const [primary, ...rest] = candidates;

        return successResult(
          {
            tool: 'compose_builder',
            coverage_status: 'partial',
            confidence: 0.93,
            confidence_reason: 'Deterministic equation engine with strict validation checks.',
            last_verified_at: nowIsoDate(),
            source: 'Compose rule engine derived from Tabla Focus compose formulas.',
          },
          {
            request: {
              taal,
              resolved_taal_id: taalEntry.taal_id,
              form: resolvedForm,
              jati,
              cycles: cycles ?? primary.cycles,
            },
            composition: primary,
            alternatives: rest.slice(0, 4),
          },
        );
      }),
  );
}
