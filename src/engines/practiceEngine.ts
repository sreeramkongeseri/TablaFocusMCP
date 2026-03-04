import { PracticeAvailability, PracticeWeekContext } from '../types.js';
import { clamp } from '../utils.js';

export interface PracticeCoachInput {
  goals: string[];
  availability: PracticeAvailability;
  weekContext?: PracticeWeekContext;
}

export interface PracticeCoachResult {
  weekly_target_minutes: number;
  days_per_week: number;
  daily_target_minutes: number;
  adaptive_adjustments: string[];
  progress_snapshot: {
    completed_minutes: number;
    adherence_percent: number;
    missed_days: number;
    fatigue: 'low' | 'medium' | 'high';
  };
  sessions: Array<{
    day_index: number;
    minutes: number;
    blocks: Array<{ focus: string; minutes: number; objective: string }>;
  }>;
}

export function buildPracticePlan(input: PracticeCoachInput): PracticeCoachResult {
  const days = clamp(input.availability.days_per_week ?? 5, 1, 7);
  const daily = input.availability.daily_minutes ?? 0;
  const weeklyFromDaily = daily > 0 ? daily * days : 0;
  const requestedWeekly = input.availability.weekly_minutes ?? 0;

  const baselineWeekly =
    requestedWeekly > 0 && weeklyFromDaily > 0
      ? Math.min(requestedWeekly, weeklyFromDaily)
      : Math.max(requestedWeekly, weeklyFromDaily);

  const conservativeWeekly = Math.max(30, baselineWeekly || 150);

  const fatigue = input.weekContext?.fatigue ?? 'medium';
  const fatigueFactor = fatigue === 'high' ? 0.8 : fatigue === 'low' ? 1 : 0.9;

  const missedDays = clamp(input.weekContext?.missed_days ?? 0, 0, 7);
  const continuityFactor = clamp(1 - missedDays * 0.05, 0.7, 1);

  const weeklyTarget = Math.round(conservativeWeekly * fatigueFactor * continuityFactor);
  const dailyTarget = Math.max(10, Math.round(weeklyTarget / days));

  const completedMinutes = Math.max(0, input.weekContext?.completed_minutes ?? 0);
  const adherence = clamp(Math.round((completedMinutes / Math.max(1, weeklyTarget)) * 100), 0, 200);

  const adjustments: string[] = [];
  if (missedDays > 0) {
    adjustments.push(`Reduced load by ${missedDays * 5}% due to ${missedDays} missed day(s).`);
  }
  if (fatigue === 'high') {
    adjustments.push('Using lower-intensity cycle: more recap and fewer dense layakari blocks.');
  }
  if (dailyTarget <= 20) {
    adjustments.push('Micro-session mode enabled: short sessions with strict focus.');
  }
  if (adherence < 70) {
    adjustments.push('Next week emphasizes continuity over complexity to rebuild consistency.');
  }

  const sessions = Array.from({ length: days }, (_, idx) => {
    const dayIndex = idx + 1;
    const minutes = dailyTarget;

    const warmup = Math.max(3, Math.round(minutes * 0.2));
    const taalWork = Math.max(3, Math.round(minutes * 0.35));
    const compositionWork = Math.max(3, Math.round(minutes * 0.25));
    const assessment = Math.max(2, minutes - warmup - taalWork - compositionWork);

    const goalFocus = input.goals[idx % Math.max(1, input.goals.length)] ?? 'steady progress';

    return {
      day_index: dayIndex,
      minutes,
      blocks: [
        {
          focus: 'warmup',
          minutes: warmup,
          objective: 'Clarity of bols and stable pulse.',
        },
        {
          focus: 'taal_catalog',
          minutes: taalWork,
          objective: `Cycle stability and counting accuracy for goal: ${goalFocus}.`,
        },
        {
          focus: 'composition',
          minutes: compositionWork,
          objective: 'Build or validate tihai/tukra/chakradhar ending on sam.',
        },
        {
          focus: 'assessment',
          minutes: assessment,
          objective: 'Short quiz/mock review and error logging.',
        },
      ],
    };
  });

  return {
    weekly_target_minutes: weeklyTarget,
    days_per_week: days,
    daily_target_minutes: dailyTarget,
    adaptive_adjustments: adjustments,
    progress_snapshot: {
      completed_minutes: completedMinutes,
      adherence_percent: adherence,
      missed_days: missedDays,
      fatigue,
    },
    sessions,
  };
}
