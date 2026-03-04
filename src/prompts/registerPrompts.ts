import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export function registerPrompts(server: McpServer): void {
  server.registerPrompt(
    'cert_prep_plan',
    {
      title: 'Certification Prep Plan',
      description:
        'Guided workflow for certification preparation using catalog lookup, mock assessment generation, and weekly planning.',
      argsSchema: {
        board: z.string().min(1).describe('Certification board token, for example ABGMVM'),
        certification_level: z
          .string()
          .min(1)
          .describe('Certification level token, for example MADHYAMA_PRATHAM'),
        days_per_week: z.coerce
          .number()
          .int()
          .min(1)
          .max(7)
          .describe('Practice days available per week'),
        minutes_per_day: z.coerce
          .number()
          .int()
          .min(1)
          .max(600)
          .describe('Practice minutes available per day'),
      },
    },
    async ({ board, certification_level, days_per_week, minutes_per_day }) => ({
      description:
        'Certification prep workflow that validates board/level context, produces a mock assessment, and generates a weekly plan.',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: [
              'Run a certification preparation workflow for tabla study.',
              '',
              `Parameters: board=${board}, certification_level=${certification_level}, days_per_week=${days_per_week}, minutes_per_day=${minutes_per_day}.`,
              '',
              'Steps:',
              '1) Read resource `tabla://certification-boards` and verify the board and level exist.',
              '2) Call `certification_catalog` with the same board and certification_level to fetch objective coverage.',
              '3) Call `assessment_builder` using mode=`cert_mock`, board, certification_level, and count=20.',
              '4) Call `practice_coach` with goals focused on certification readiness and availability derived from days_per_week and minutes_per_day.',
              '5) Return a final output with: study priorities, mock-test outcome summary, and a day-wise weekly schedule.',
            ].join('\n'),
          },
        },
      ],
    }),
  );

  server.registerPrompt(
    'weekly_practice_reset',
    {
      title: 'Weekly Practice Reset',
      description:
        'Guided workflow to rebuild a practical weekly schedule after missed sessions or fatigue.',
      argsSchema: {
        goals: z.string().min(1).describe('Primary goals for the week, separated by semicolons'),
        daily_minutes: z.coerce
          .number()
          .int()
          .min(1)
          .max(600)
          .describe('Practice minutes available per day'),
        days_per_week: z.coerce
          .number()
          .int()
          .min(1)
          .max(7)
          .describe('Practice days available this week'),
        missed_days: z.coerce.number().int().min(0).max(7).optional(),
        completed_minutes: z.coerce.number().int().min(0).max(4000).optional(),
        fatigue: z.enum(['low', 'medium', 'high']).optional(),
      },
    },
    async ({ goals, daily_minutes, days_per_week, missed_days, completed_minutes, fatigue }) => ({
      description:
        'Weekly reset workflow that updates the plan using availability and optional context.',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: [
              'Run a weekly tabla practice reset.',
              '',
              `Goals: ${goals}`,
              `Availability: daily_minutes=${daily_minutes}, days_per_week=${days_per_week}`,
              `Week context: missed_days=${missed_days ?? 0}, completed_minutes=${completed_minutes ?? 0}, fatigue=${fatigue ?? 'medium'}`,
              '',
              'Steps:',
              '1) Split goals by semicolon into a string array, then call `practice_coach` with that goals array, availability, and week_context.',
              '2) If any goal mentions tihai/tukra/chakradhar, call `compose_builder` for one beginner-safe pattern in teental.',
              '3) Return a concise weekly schedule with recovery guidance and one measurable checkpoint.',
            ].join('\n'),
          },
        },
      ],
    }),
  );
}
