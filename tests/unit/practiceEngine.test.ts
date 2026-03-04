import { describe, expect, it } from 'vitest';
import { buildPracticePlan } from '../../src/engines/practiceEngine.js';

describe('practiceEngine', () => {
  it('builds practical plan with adaptations', () => {
    const plan = buildPracticePlan({
      goals: ['sam landing'],
      availability: { daily_minutes: 20, days_per_week: 4 },
      weekContext: { missed_days: 2, fatigue: 'high', completed_minutes: 40 },
    });

    expect(plan.days_per_week).toBe(4);
    expect(plan.sessions).toHaveLength(4);
    expect(plan.adaptive_adjustments.length).toBeGreaterThan(0);
  });
});
