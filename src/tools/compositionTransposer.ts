import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { AppContext } from '../context.js';
import {
  normalizeCompositionForm,
  transposeComposition,
} from '../engines/compositionRuleEngine.js';
import { ToolError } from '../errors/model.js';
import { Jati } from '../types.js';
import { guarded, nowIsoDate, successResult } from '../toolRuntime.js';

const compositionInputSchema = z.object({
  P: z.number().int().min(0).optional(),
  G: z.number().int().min(0).optional(),
  M: z.number().int().min(0).optional(),
  g: z.number().int().min(0).optional(),
  segments: z
    .array(
      z.object({
        kind: z.enum(['mukhra', 'phrase', 'gap', 'macro_gap']),
        index: z.number().int().min(1),
        round_index: z.number().int().min(0),
        start_pulse: z.number().int().min(1),
        end_pulse: z.number().int().min(1),
        length_pulses: z.number().int().min(1),
        start_beat: z.number().min(1),
        end_beat: z.number().min(1),
        length_beats: z.number().positive(),
      }),
    )
    .optional(),
});

const jatiSchema = z.enum(['tisra', 'chatusra', 'khanda', 'misra']);

export function registerCompositionTransposerTool(server: McpServer, context: AppContext): void {
  server.registerTool(
    'composition_transposer',
    {
      title: 'Composition Transposer',
      description:
        'Transpose a valid tihai, tukra, or chakradhar into a new taal or jati context while preserving structural feel as closely as possible.',
      inputSchema: {
        source: z.object({
          taal: z.string().min(1),
          form: z.string().min(1),
          jati: jatiSchema,
          cycles: z.number().int().min(1).max(12),
          composition_input: compositionInputSchema,
        }),
        target: z.object({
          taal: z.string().min(1),
          jati: jatiSchema,
          cycles: z.number().int().min(1).max(12).optional(),
        }),
        preserve_mode: z.literal('shape_ratio').optional(),
      },
    },
    async ({ source, target, preserve_mode }) =>
      guarded(context.limiter, 'composition_transposer', async () => {
        const sourceTaal = context.store.getTaalById(source.taal);
        if (!sourceTaal) {
          throw new ToolError('NOT_FOUND', `Source taal not found: ${source.taal}`);
        }

        const targetTaal = context.store.getTaalById(target.taal);
        if (!targetTaal) {
          throw new ToolError('NOT_FOUND', `Target taal not found: ${target.taal}`);
        }

        const resolvedForm = normalizeCompositionForm(source.form);

        const result = transposeComposition({
          source: {
            matras: sourceTaal.matras,
            form: resolvedForm,
            jati: source.jati as Jati,
            cycles: source.cycles,
            parameters: {
              P: source.composition_input.P,
              G: source.composition_input.G,
              M: source.composition_input.M,
              g: source.composition_input.g,
            },
            segments: source.composition_input.segments,
          },
          target: {
            matras: targetTaal.matras,
            jati: target.jati as Jati,
            cycles: target.cycles,
          },
          preserve_mode,
        });

        return successResult(
          {
            tool: 'composition_transposer',
            coverage_status: 'partial',
            confidence: 0.88,
            confidence_reason:
              'Deterministic structural transposition with exact math validation, but it does not preserve bols or gharana-specific phrasing.',
            last_verified_at: nowIsoDate(),
            source: 'composition_rule_engine transposition scorer',
          },
          {
            request: {
              source: {
                taal: source.taal,
                resolved_taal_id: sourceTaal.taal_id,
                form: resolvedForm,
                jati: source.jati,
                cycles: source.cycles,
                composition_input: source.composition_input,
              },
              target: {
                taal: target.taal,
                resolved_taal_id: targetTaal.taal_id,
                jati: target.jati,
                cycles: target.cycles ?? null,
              },
              preserve_mode: result.preserve_mode,
            },
            transposition: result,
          },
        );
      }),
  );
}
