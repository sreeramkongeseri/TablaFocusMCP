import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { AppContext } from '../context.js';
import { buildPracticePlan } from '../engines/practiceEngine.js';
import { guarded, nowIsoDate, successResult } from '../toolRuntime.js';

const availabilitySchema = z.object({
  daily_minutes: z.number().int().min(1).max(600).optional(),
  weekly_minutes: z.number().int().min(1).max(4000).optional(),
  days_per_week: z.number().int().min(1).max(7).optional(),
});

const weekContextSchema = z.object({
  missed_days: z.number().int().min(0).max(7).optional(),
  completed_minutes: z.number().int().min(0).max(4000).optional(),
  fatigue: z.enum(['low', 'medium', 'high']).optional(),
});

export function registerPracticeCoachTool(server: McpServer, context: AppContext): void {
  server.registerTool(
    'practice_coach',
    {
      title: 'Practice Coach',
      description:
        'Create practical weekly plans and adaptive updates based on real availability, missed sessions, and fatigue.',
      inputSchema: {
        profile_id: z.string().optional(),
        goals: z.array(z.string().min(1)).min(1),
        availability: availabilitySchema,
        week_context: weekContextSchema.optional(),
      },
    },
    async ({ profile_id, goals, availability, week_context }) =>
      guarded(context.limiter, 'practice_coach', async () => {
        const plan = buildPracticePlan({ goals, availability, weekContext: week_context });

        return successResult(
          {
            tool: 'practice_coach',
            coverage_status: 'partial',
            confidence: 0.82,
            confidence_reason:
              'Planner is deterministic and practical, but not yet linked to per-user historical telemetry storage.',
            last_verified_at: nowIsoDate(),
            source: 'practice_engine + app-inspired planning heuristics',
          },
          {
            profile_id: profile_id ?? null,
            goals,
            plan,
          },
        );
      }),
  );
}
