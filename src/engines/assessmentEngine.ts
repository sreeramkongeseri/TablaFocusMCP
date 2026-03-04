import { QuizBankQuestion } from '../types.js';
import { ToolError } from '../errors/model.js';
import { stableShuffle } from '../utils.js';

export type AssessmentMode = 'practice_quiz' | 'cert_mock';

export interface AssessmentInput {
  mode: AssessmentMode;
  count: number;
  questions: QuizBankQuestion[];
  seed?: string;
}

export interface AssessmentResult {
  mode: AssessmentMode;
  total_questions: number;
  questions: Array<{
    id: number;
    question_text: string;
    question_type: string;
    category: string;
    difficulty: string;
    board?: string;
    level?: string;
    paper?: string;
    objective_id?: string;
    options: string[];
  }>;
  answer_key: Array<{
    id: number;
    correct_option: string;
    correct_text: string;
    objective_id?: string;
  }>;
  rubric: {
    total_marks: number;
    marks_per_question: number;
    bands: Array<{ min_percent: number; label: string }>;
  };
}

const syllabusTagRegex = /^\s*\[([A-Z0-9_.]+)(?:\s+v\d+)?\]\s*/;

export function buildAssessment(input: AssessmentInput): AssessmentResult {
  if (input.count < 1 || input.count > 100) {
    throw new ToolError('INVALID_INPUT', 'count must be between 1 and 100');
  }

  if (input.questions.length === 0) {
    throw new ToolError('NOT_FOUND', 'No question set matched the requested filters');
  }

  const sorted = [...input.questions].sort((a, b) => {
    const aKey = `${a.objectiveId ?? ''}:${a.questionText}`;
    const bKey = `${b.objectiveId ?? ''}:${b.questionText}`;
    return aKey.localeCompare(bKey);
  });

  const pool = stableShuffle(sorted, input.seed ?? `${input.mode}:${input.count}`);
  const selected = pool.slice(0, Math.min(input.count, pool.length));

  const questions = selected.map((q, index) => ({
    id: index + 1,
    question_text: cleanQuestionText(q.questionText),
    question_type: q.questionType,
    category: q.category,
    difficulty: q.difficulty,
    board: q.board,
    level: q.level,
    paper: q.paper,
    objective_id: q.objectiveId,
    options: q.options,
  }));

  const answerKey = selected.map((q, index) => {
    const optionIndex = clampOptionIndex(q.correctIndex, q.options.length);
    return {
      id: index + 1,
      correct_option: optionLabel(optionIndex),
      correct_text: q.options[optionIndex] ?? '',
      objective_id: q.objectiveId,
    };
  });

  return {
    mode: input.mode,
    total_questions: selected.length,
    questions,
    answer_key: answerKey,
    rubric: {
      total_marks: selected.length,
      marks_per_question: 1,
      bands: [
        { min_percent: 85, label: 'Strong pass' },
        { min_percent: 70, label: 'Pass' },
        { min_percent: 50, label: 'Needs revision' },
        { min_percent: 0, label: 'Rebuild fundamentals' },
      ],
    },
  };
}

export function cleanQuestionText(questionText: string): string {
  return questionText.replace(syllabusTagRegex, '').trim();
}

function clampOptionIndex(index: number, optionCount: number): number {
  if (optionCount <= 0) {
    return 0;
  }
  if (index < 0) {
    return 0;
  }
  if (index >= optionCount) {
    return optionCount - 1;
  }
  return index;
}

function optionLabel(index: number): string {
  return ['A', 'B', 'C', 'D', 'E'][index] ?? 'A';
}
