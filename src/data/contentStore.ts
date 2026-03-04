import fs from 'node:fs/promises';
import path from 'node:path';
import { AppConfig } from '../config.js';
import {
  CertificationBoardMetadata,
  GlossaryEntry,
  QuizBank,
  QuizBankQuestion,
  TalaEntry,
  TalaVibhag,
} from '../types.js';
import { normalize, parseLevelLabel, slugify } from '../utils.js';

export interface NormalizedTaal {
  taal_id: string;
  name: string;
  source_name: string;
  aliases: string[];
  matras: number;
  vibhag_pattern: number[];
  vibhags: TalaVibhag[];
  sam_matra: number;
  khali_matras: number[];
  clap_wave: Array<{ matra: number; action: 'clap' | 'wave'; label: string }>;
  counting_guidance: {
    cycle_count: string;
    vibhag_count: string;
  };
  theka: string;
  description: string;
}

export interface CertificationLevelSummary {
  board: string;
  certification_level: string;
  level_label: string;
  total_questions: number;
  papers: Record<string, number>;
  categories: Record<string, number>;
  objectives: Array<{ objective_id: string; question_count: number }>;
}

export class ContentStore {
  private glossary: GlossaryEntry[] = [];
  private taals: NormalizedTaal[] = [];
  private quizQuestions: QuizBankQuestion[] = [];
  private boards: CertificationBoardMetadata[] = [];

  constructor(private readonly config: AppConfig) {}

  async load(): Promise<void> {
    const glossaryPath = path.join(this.config.dataDir, 'glossary.json');
    const talasPath = path.join(this.config.dataDir, 'talas.json');
    const quizPath = path.join(this.config.dataDir, 'quiz_bank.json');
    const boardsPath = path.join(this.config.curatedDataDir, 'certification_boards.json');

    const [glossaryRaw, talasRaw, quizRaw, boardsRaw] = await Promise.all([
      this.readJson<GlossaryEntry[]>(glossaryPath),
      this.readJson<TalaEntry[]>(talasPath),
      this.readJson<QuizBank>(quizPath),
      this.readJson<CertificationBoardMetadata[]>(boardsPath),
    ]);

    this.glossary = glossaryRaw;
    this.taals = talasRaw.map((t) => this.normalizeTaal(t));
    this.quizQuestions = quizRaw.questions;
    this.boards = boardsRaw;
  }

  getGlossary(params: { term?: string; category?: string; limit?: number }): GlossaryEntry[] {
    const term = params.term ? normalize(params.term) : undefined;
    const category = params.category ? normalize(params.category) : undefined;
    const limit = params.limit ?? 25;

    const filtered = this.glossary.filter((entry) => {
      const inCategory = category ? normalize(entry.category) === category : true;
      if (!inCategory) {
        return false;
      }

      if (!term) {
        return true;
      }

      if (normalize(entry.term).includes(term)) {
        return true;
      }

      return entry.altSpellings.some((alt) => normalize(alt).includes(term));
    });

    return filtered.slice(0, Math.max(1, limit));
  }

  listGlossaryEntries(): GlossaryEntry[] {
    return this.glossary;
  }

  listGlossaryCategories(): string[] {
    return [...new Set(this.glossary.map((entry) => entry.category))].sort();
  }

  listTaals(): NormalizedTaal[] {
    return this.taals;
  }

  getTaalById(taalId: string): NormalizedTaal | undefined {
    const normalized = slugify(taalId);
    return this.taals.find(
      (t) => t.taal_id === normalized || t.aliases.map(slugify).includes(normalized),
    );
  }

  listCertificationBoards(): CertificationBoardMetadata[] {
    return this.boards;
  }

  getCertificationLevelSummaries(params: {
    board?: string;
    certificationLevel?: string;
  }): CertificationLevelSummary[] {
    const board = params.board ? normalize(params.board) : undefined;
    const level = params.certificationLevel ? normalize(params.certificationLevel) : undefined;

    const grouped = new Map<string, QuizBankQuestion[]>();
    for (const question of this.quizQuestions) {
      if (!question.board || !question.level) {
        continue;
      }

      if (board && normalize(question.board) !== board) {
        continue;
      }

      if (level && normalize(question.level) !== level) {
        continue;
      }

      const key = `${question.board}::${question.level}`;
      const bucket = grouped.get(key) ?? [];
      bucket.push(question);
      grouped.set(key, bucket);
    }

    return [...grouped.entries()].map(([key, questions]) => {
      const [boardName, levelToken] = key.split('::');
      const papers = this.countBy(questions, (q) => q.paper ?? 'UNKNOWN');
      const categories = this.countBy(questions, (q) => q.category ?? 'Unknown');
      const objectiveCounts = this.countBy(questions, (q) => q.objectiveId ?? 'UNSPECIFIED');

      const objectives = Object.entries(objectiveCounts)
        .map(([objective_id, question_count]) => ({ objective_id, question_count }))
        .sort(
          (a, b) =>
            b.question_count - a.question_count || a.objective_id.localeCompare(b.objective_id),
        );

      return {
        board: boardName,
        certification_level: levelToken,
        level_label: parseLevelLabel(levelToken),
        total_questions: questions.length,
        papers,
        categories,
        objectives,
      };
    });
  }

  getQuestions(params: {
    board?: string;
    certificationLevel?: string;
    category?: string;
    taal?: string;
  }): QuizBankQuestion[] {
    const board = params.board ? normalize(params.board) : undefined;
    const level = params.certificationLevel ? normalize(params.certificationLevel) : undefined;
    const category = params.category ? normalize(params.category) : undefined;
    const taal = params.taal ? normalize(params.taal) : undefined;

    return this.quizQuestions.filter((q) => {
      if (board && normalize(q.board ?? '') !== board) {
        return false;
      }
      if (level && normalize(q.level ?? '') !== level) {
        return false;
      }
      if (category && normalize(q.category ?? '') !== category) {
        return false;
      }
      if (taal && !normalize(q.questionText).includes(taal)) {
        return false;
      }
      return true;
    });
  }

  private normalizeTaal(raw: TalaEntry): NormalizedTaal {
    const sourceName = raw.name.trim();
    const baseName = sourceName.replace(/\s*\(.*\)\s*$/, '').trim();
    const taalId = slugify(baseName);

    const vibhagPattern = raw.vibhags.map((v) => v.matraEnd - v.matraStart + 1);
    const sam = raw.vibhags.find((v) => v.type === 'sam')?.matraStart ?? 1;
    const khaliMatras = raw.vibhags.filter((v) => v.type === 'khali').map((v) => v.matraStart);

    const clapWave = raw.vibhags.map((v) => ({
      matra: v.matraStart,
      action: v.type === 'khali' ? ('wave' as const) : ('clap' as const),
      label: v.type,
    }));

    const cycleCount = Array.from({ length: raw.matras }, (_, i) => `${i + 1}`).join(' ');
    const groupedCounts: string[] = [];
    for (const vibhag of raw.vibhags) {
      const chunk = Array.from(
        { length: vibhag.matraEnd - vibhag.matraStart + 1 },
        (_, idx) => `${vibhag.matraStart + idx}`,
      ).join(' ');
      groupedCounts.push(chunk);
    }

    return {
      taal_id: taalId,
      name: baseName,
      source_name: sourceName,
      aliases: [sourceName, baseName],
      matras: raw.matras,
      vibhag_pattern: vibhagPattern,
      vibhags: raw.vibhags,
      sam_matra: sam,
      khali_matras: khaliMatras,
      clap_wave: clapWave,
      counting_guidance: {
        cycle_count: cycleCount,
        vibhag_count: groupedCounts.join(' | '),
      },
      theka: raw.theka,
      description: raw.talaDescription,
    };
  }

  private countBy<T>(items: T[], keyFn: (item: T) => string): Record<string, number> {
    return items.reduce<Record<string, number>>((acc, item) => {
      const key = keyFn(item);
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
  }

  private async readJson<T>(filePath: string): Promise<T> {
    const text = await fs.readFile(filePath, 'utf8');
    return JSON.parse(text) as T;
  }
}
