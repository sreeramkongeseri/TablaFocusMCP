import { describe, expect, it } from 'vitest';
import { buildAssessment, cleanQuestionText } from '../../src/engines/assessmentEngine.js';

describe('assessmentEngine', () => {
  it('cleans syllabus tags', () => {
    const cleaned = cleanQuestionText('[ABG.MP.T1.X v1] Question text');
    expect(cleaned).toBe('Question text');
  });

  it('builds answer key', () => {
    const result = buildAssessment({
      mode: 'practice_quiz',
      count: 1,
      questions: [
        {
          questionText: 'Sample?',
          questionType: 'mcq',
          options: ['A1', 'B1', 'C1', 'D1'],
          correctIndex: 2,
          category: 'Theory',
          difficulty: 'beginner',
        },
      ],
    });

    expect(result.questions).toHaveLength(1);
    expect(result.answer_key[0].correct_option).toBe('C');
    expect(result.answer_key[0].rationale.correct_reason.length).toBeGreaterThan(0);
    expect(result.answer_key[0].rationale.incorrect_reasons).toHaveLength(3);
    expect(result.answer_key[0].rationale.incorrect_reasons[0].reason.length).toBeGreaterThan(0);
  });
});
