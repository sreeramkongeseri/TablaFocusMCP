import { CertificationBoardMetadata } from '../types.js';
import { CertificationLevelSummary } from '../data/contentStore.js';

export interface CertificationCatalogResult {
  boards: Array<{
    board: string;
    full_name: string;
    description: string;
    website?: string;
    references: Array<{ title: string; url: string }>;
    levels: Array<{
      certification_level: string;
      level_label: string;
      total_questions: number;
      papers: Record<string, number>;
      categories: Record<string, number>;
      syllabus_domains: Array<{ domain: string; question_count: number }>;
      objective_count: number;
      top_objectives: Array<{ objective_id: string; question_count: number }>;
    }>;
  }>;
}

export function buildCertificationCatalog(params: {
  metadata: CertificationBoardMetadata[];
  summaries: CertificationLevelSummary[];
}): CertificationCatalogResult {
  const byBoard = new Map<string, CertificationLevelSummary[]>();
  for (const summary of params.summaries) {
    const bucket = byBoard.get(summary.board) ?? [];
    bucket.push(summary);
    byBoard.set(summary.board, bucket);
  }

  const boards = params.metadata.map((boardMeta) => {
    const levelSummaries = byBoard.get(boardMeta.board) ?? [];
    const levels = levelSummaries
      .sort((a, b) => a.certification_level.localeCompare(b.certification_level))
      .map((summary) => {
        const domainCounts = new Map<string, number>();

        for (const objective of summary.objectives) {
          const domain = objectiveDomain(objective.objective_id);
          domainCounts.set(domain, (domainCounts.get(domain) ?? 0) + objective.question_count);
        }

        const syllabusDomains = [...domainCounts.entries()]
          .map(([domain, question_count]) => ({ domain, question_count }))
          .sort((a, b) => b.question_count - a.question_count || a.domain.localeCompare(b.domain));

        return {
          certification_level: summary.certification_level,
          level_label: summary.level_label,
          total_questions: summary.total_questions,
          papers: summary.papers,
          categories: summary.categories,
          syllabus_domains: syllabusDomains,
          objective_count: summary.objectives.length,
          top_objectives: summary.objectives.slice(0, 12),
        };
      });

    return {
      board: boardMeta.board,
      full_name: boardMeta.fullName,
      description: boardMeta.description,
      website: boardMeta.website,
      references: boardMeta.references,
      levels,
    };
  });

  return { boards };
}

function objectiveDomain(objectiveId: string): string {
  const tokens = objectiveId.split('.');
  if (tokens.length >= 4) {
    return `${tokens[2]}.${tokens[3]}`;
  }
  if (tokens.length >= 3) {
    return tokens[2];
  }
  return 'GENERAL';
}
