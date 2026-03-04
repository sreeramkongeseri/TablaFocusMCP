import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { AppContext } from '../context.js';
import { ToolError } from '../errors/model.js';
import { guarded, nowIsoDate, successResult } from '../toolRuntime.js';

function buildClapWaveScript(
  clapWave: Array<{ matra: number; action: 'clap' | 'wave'; label: string }>,
): string {
  return clapWave
    .map((item) => `${item.matra}:${item.action}${item.label ? `(${item.label})` : ''}`)
    .join(' | ');
}

export function registerExplainTaalTool(server: McpServer, context: AppContext): void {
  server.registerTool(
    'explain_taal',
    {
      title: 'Explain Taal (Compatibility Alias)',
      description:
        'Compatibility alias for clients expecting explain_taal. Uses canonical data from taal_catalog details.',
      inputSchema: {
        taal: z.string().min(1),
      },
    },
    async ({ taal }) =>
      guarded(context.limiter, 'explain_taal', async () => {
        const entry = context.store.getTaalById(taal);
        if (!entry) {
          throw new ToolError('NOT_FOUND', `Taal not found: ${taal}`);
        }

        const explanation = {
          taal_id: entry.taal_id,
          name: entry.name,
          matras: entry.matras,
          vibhag_pattern: entry.vibhag_pattern,
          sam: entry.sam_matra,
          khali: entry.khali_matras,
          clap_wave: entry.clap_wave,
          clap_wave_script: buildClapWaveScript(entry.clap_wave),
          counting_guidance: entry.counting_guidance,
          theka: entry.theka,
          description: entry.description,
          canonical_source_tool: 'taal_catalog',
        };

        return successResult(
          {
            tool: 'explain_taal',
            coverage_status: 'partial',
            confidence: 0.9,
            confidence_reason:
              'Alias view over canonical taal_catalog dataset from configured talas data.',
            last_verified_at: nowIsoDate(),
            source: 'configured dataDir/talas.json (via taal_catalog normalization)',
          },
          {
            request: {
              taal,
              resolved_taal_id: entry.taal_id,
            },
            explanation,
          },
        );
      }),
  );
}
