export type CoverageStatus = 'full' | 'partial' | 'conflicted' | 'sparse' | 'unavailable';

export interface GlossaryEntry {
  term: string;
  definition: string;
  category: string;
  altSpellings: string[];
}

export type VibhagType = 'sam' | 'tali' | 'khali';

export interface TalaVibhag {
  type: VibhagType;
  position: number;
  matraStart: number;
  matraEnd: number;
}

export interface TalaEntry {
  name: string;
  matras: number;
  vibhags: TalaVibhag[];
  theka: string;
  talaDescription: string;
}

export interface QuizBankQuestion {
  questionText: string;
  questionType:
    | 'mcq'
    | 'true_false'
    | 'assertion_reason'
    | 'sequence_order'
    | 'odd_one_out'
    | 'match_set';
  options: string[];
  correctIndex: number;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  sourceType?: string;
  objectiveId?: string;
  board?: string;
  level?: string;
  paper?: string;
  assessability?: string;
}

export interface QuizBank {
  questions: QuizBankQuestion[];
}

export interface CertificationBoardMetadata {
  board: string;
  fullName: string;
  website?: string;
  description: string;
  levels: string[];
  references: Array<{ title: string; url: string }>;
}

export type CompositionForm = 'tihai' | 'tukra' | 'chakradhar';

export type Jati = 'tisra' | 'chatusra' | 'khanda' | 'misra';

export interface CompositionSegment {
  kind: 'mukhra' | 'phrase' | 'gap' | 'macro_gap';
  index: number;
  round_index: number;
  start_pulse: number;
  end_pulse: number;
  length_pulses: number;
  start_beat: number;
  end_beat: number;
  length_beats: number;
}

export interface CompositionParameters {
  P?: number;
  G?: number;
  M?: number;
  g?: number;
}

export interface PracticeAvailability {
  daily_minutes?: number;
  weekly_minutes?: number;
  days_per_week?: number;
}

export interface PracticeWeekContext {
  missed_days?: number;
  completed_minutes?: number;
  fatigue?: 'low' | 'medium' | 'high';
}
