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

  server.registerPrompt(
    'exam_week_plan',
    {
      title: 'Exam Week Plan',
      description:
        'Guided 7-day certification-focused workflow that combines catalog targeting, mock testing, and adaptive scheduling.',
      argsSchema: {
        board: z.string().min(1).describe('Certification board token, for example ABGMVM'),
        certification_level: z
          .string()
          .min(1)
          .describe('Certification level token, for example MADHYAMA_PRATHAM'),
        daily_minutes: z.coerce
          .number()
          .int()
          .min(1)
          .max(600)
          .describe('Practice minutes available per day during exam week'),
        weak_areas: z
          .string()
          .optional()
          .describe('Optional weak areas separated by semicolons'),
        fatigue: z.enum(['low', 'medium', 'high']).optional(),
      },
    },
    async ({ board, certification_level, daily_minutes, weak_areas, fatigue }) => ({
      description:
        'Exam-week workflow that uses catalog context, a mock test, and adaptive planning to produce a focused 7-day schedule.',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: [
              'Run a 7-day tabla certification exam-week workflow.',
              '',
              `Parameters: board=${board}, certification_level=${certification_level}, daily_minutes=${daily_minutes}, fatigue=${fatigue ?? 'medium'}.`,
              `Weak areas: ${weak_areas ?? 'none provided'}`,
              '',
              'Steps:',
              '1) Read `tabla://certification-boards` and validate board + certification_level.',
              '2) Call `certification_catalog` for the same board and certification_level to identify coverage priorities.',
              '3) Call `assessment_builder` with mode=`cert_mock`, board, certification_level, and count=25.',
              '4) Convert weak_areas into goals (split by semicolon when provided), combine with mock-test gaps, and call `practice_coach` using availability { daily_minutes, days_per_week: 7 } and week_context with fatigue.',
              '5) Return an exam-week plan with day-by-day focus, one full mock day, one targeted revision day, and a final taper day.',
            ].join('\n'),
          },
        },
      ],
    }),
  );

  server.registerPrompt(
    'missed_week_recovery',
    {
      title: 'Missed Week Recovery',
      description:
        'Guided recovery workflow to restart momentum after missed sessions with realistic load, recalibration, and checkpoints.',
      argsSchema: {
        goals: z.string().min(1).describe('Primary goals for recovery week, separated by semicolons'),
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
        'Recovery workflow that rebuilds consistency first, then reintroduces complexity with quick assessment feedback.',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: [
              'Run a missed-week recovery workflow for tabla practice.',
              '',
              `Goals: ${goals}`,
              `Availability: daily_minutes=${daily_minutes}, days_per_week=${days_per_week}`,
              `Week context: missed_days=${missed_days ?? 0}, completed_minutes=${completed_minutes ?? 0}, fatigue=${fatigue ?? 'medium'}`,
              '',
              'Steps:',
              '1) Split goals by semicolon into a string array and call `practice_coach` with availability + week_context.',
              '2) Call `assessment_builder` with mode=`practice_quiz` and count=8 to recalibrate current level.',
              '3) If goals include tihai/tukra/chakradhar terms, call `compose_builder` for one low-risk pattern and then `composition_validator` for a quick correctness check.',
              '4) Return a restart plan with lighter first two sessions, one checkpoint mid-week, and one measurable end-of-week consistency target.',
            ].join('\n'),
          },
        },
      ],
    }),
  );

  server.registerPrompt(
    'composition_polish',
    {
      title: 'Composition Polish',
      description:
        'Guided iterative workflow to draft, validate, and refine a composition until it lands cleanly on sam.',
      argsSchema: {
        taal: z.string().min(1).describe('Taal name or id, for example teental'),
        form: z.string().min(1).describe('Composition form, for example tihai or chakradhar'),
        jati: z
          .enum(['tisra', 'chatusra', 'khanda', 'misra'])
          .describe('Subdivision style for composition math'),
        cycles: z.coerce
          .number()
          .int()
          .min(1)
          .max(12)
          .optional()
          .describe('Optional target cycle count'),
        polish_rounds: z.coerce
          .number()
          .int()
          .min(1)
          .max(3)
          .optional()
          .describe('How many refinement passes to run'),
      },
    },
    async ({ taal, form, jati, cycles, polish_rounds }) => ({
      description:
        'Composition polishing workflow with iterative build/validate passes and musical cleanup guidance.',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: [
              'Run a composition-polishing workflow for tabla.',
              '',
              `Parameters: taal=${taal}, form=${form}, jati=${jati}, cycles=${cycles ?? 'auto'}, polish_rounds=${polish_rounds ?? 2}.`,
              '',
              'Steps:',
              '1) Call `taal_catalog` to resolve taal details and confirm matra/vibhag structure.',
              '2) Call `compose_builder` with the given taal, form, jati, and optional cycles to create a candidate composition.',
              '3) Call `composition_validator` against the generated composition and report equation/timeline status.',
              '4) Repeat build + validate refinement for polish_rounds (max 3), prioritizing clean sam landing and simpler phrase balance when validation or readability is weak.',
              '5) Return final polished composition, a short change log across rounds, and one performance tip for tempo progression.',
            ].join('\n'),
          },
        },
      ],
    }),
  );
}
