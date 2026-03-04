import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { AppContext } from '../context.js';
import { normalizeCompositionForm, validateComposition } from '../engines/compositionRuleEngine.js';
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

export function registerCompositionValidatorTool(server: McpServer, context: AppContext): void {
  server.registerTool(
    'composition_validator',
    {
      title: 'Composition Validator',
      description:
        'Validate user-entered tihai, tukra, or chakradhar structure using equation and timeline checks.',
      inputSchema: {
        taal: z.string().min(1),
        form: z.enum(['tihai', 'tukra', 'chakradhar', 'chakradar']),
        jati: z.enum(['tisra', 'chatusra', 'khanda', 'misra']),
        cycles: z.number().int().min(1).max(12),
        composition_input: compositionInputSchema,
      },
    },
    async ({ taal, form, jati, cycles, composition_input }) =>
      guarded(context.limiter, 'composition_validator', async () => {
        const taalEntry = context.store.getTaalById(taal);
        if (!taalEntry) {
          throw new ToolError('NOT_FOUND', `Taal not found: ${taal}`);
        }

        const resolvedForm = normalizeCompositionForm(form);

        const result = validateComposition({
          matras: taalEntry.matras,
          form: resolvedForm,
          jati: jati as Jati,
          cycles,
          parameters: {
            P: composition_input.P,
            G: composition_input.G,
            M: composition_input.M,
            g: composition_input.g,
          },
          segments: composition_input.segments,
        });

        return successResult(
          {
            tool: 'composition_validator',
            coverage_status: 'partial',
            confidence: 0.94,
            confidence_reason: 'Equation + timeline checks are deterministic and strict.',
            last_verified_at: nowIsoDate(),
            source: 'composition_rule_engine',
          },
          {
            request: {
              taal,
              resolved_taal_id: taalEntry.taal_id,
              form: resolvedForm,
              jati,
              cycles,
            },
            validation: result,
          },
        );
      }),
  );
}
