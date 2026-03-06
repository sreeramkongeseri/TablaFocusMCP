import { CompositionForm, CompositionParameters, CompositionSegment, Jati } from '../types.js';
import { ToolError } from '../errors/model.js';
import { toCompactLookupKey } from '../utils.js';

export const JATI_PULSES: Record<Jati, number> = {
  tisra: 3,
  chatusra: 4,
  khanda: 5,
  misra: 7,
};

export interface CompositionBuildInput {
  matras: number;
  form: CompositionForm;
  jati: Jati;
  cycles: number;
}

export interface CompositionBuildResult {
  form: CompositionForm;
  equation_template: string;
  equation_instantiated: string;
  total_pulses: number;
  pulses_per_matra: number;
  cycles: number;
  parameters: Required<CompositionParameters>;
  detected_form: string;
  segments: CompositionSegment[];
}

export interface CompositionValidationResult {
  is_valid: boolean;
  reasons: string[];
  total_pulses: number;
  checks: {
    equation: boolean;
    timeline_continuity: boolean;
    segment_sum: boolean;
  };
}

export interface CompositionTranspositionInput {
  source: {
    matras: number;
    form: CompositionForm;
    jati: Jati;
    cycles: number;
    parameters: CompositionParameters;
    segments?: CompositionSegment[];
  };
  target: {
    matras: number;
    jati: Jati;
    cycles?: number;
  };
  preserve_mode?: 'shape_ratio';
}

export interface CompositionPreservationReport {
  source_detected_form: string;
  target_detected_form: string;
  exact_subtype_match: boolean;
  ratio_distance: number;
  parameter_ratio_deltas: Record<string, number>;
}

export interface CompositionTranspositionChoice {
  score: number;
  scale_factor: number;
  composition: CompositionBuildResult;
  preservation_report: CompositionPreservationReport;
}

export interface CompositionTranspositionResult {
  preserve_mode: 'shape_ratio';
  source_validation: CompositionValidationResult;
  source_composition: CompositionBuildResult;
  composition: CompositionBuildResult;
  scale_factor: number;
  preservation_report: CompositionPreservationReport;
  alternatives: CompositionTranspositionChoice[];
  warnings: string[];
}

interface Candidate {
  P: number;
  G: number;
  M: number;
  g: number;
  score: number;
}

interface ScoredCompositionBuildResult extends CompositionBuildResult {
  candidate_score: number;
}

interface RankedTranspositionChoice extends CompositionTranspositionChoice {
  candidate_score: number;
}

const FORM_ALIASES: Record<string, CompositionForm> = {
  tihai: 'tihai',
  tihayi: 'tihai',
  tihaai: 'tihai',
  tukra: 'tukra',
  tukda: 'tukra',
  chakradhar: 'chakradhar',
  chakraadhar: 'chakradhar',
  chakradar: 'chakradhar',
  chakardar: 'chakradhar',
};

export function normalizeCompositionForm(value: string): CompositionForm {
  const normalized = toCompactLookupKey(value);
  const resolved = FORM_ALIASES[normalized];
  if (resolved) {
    return resolved;
  }
  throw new ToolError(
    'INVALID_INPUT',
    `Unsupported composition form: ${value}. Supported forms: tihai, tukra, chakradhar`,
  );
}

export function buildComposition(input: CompositionBuildInput): CompositionBuildResult {
  const candidates = listCandidateBuilds(input);
  if (candidates.length === 0) {
    throw new ToolError(
      'VALIDATION_FAILED',
      'No valid composition layout found for the given parameters',
      {
        form: input.form,
        matras: input.matras,
        cycles: input.cycles,
        jati: input.jati,
      },
    );
  }

  return toCompositionBuildResult(candidates[0]);
}

export function transposeComposition(
  input: CompositionTranspositionInput,
): CompositionTranspositionResult {
  const preserveMode = input.preserve_mode ?? 'shape_ratio';
  if (preserveMode !== 'shape_ratio') {
    throw new ToolError(
      'INVALID_INPUT',
      `Unsupported preserve_mode: ${preserveMode}. Supported modes: shape_ratio`,
    );
  }

  const sourceValidation = validateComposition({
    matras: input.source.matras,
    form: input.source.form,
    jati: input.source.jati,
    cycles: input.source.cycles,
    parameters: input.source.parameters,
    segments: input.source.segments,
  });

  if (!sourceValidation.is_valid) {
    throw new ToolError('VALIDATION_FAILED', 'Source composition is not valid for transposition', {
      reasons: sourceValidation.reasons,
      checks: sourceValidation.checks,
    });
  }

  const sourcePulsesPerMatra = JATI_PULSES[input.source.jati];
  const sourceComposition = materializeComposition({
    form: input.source.form,
    cycles: input.source.cycles,
    pulsesPerMatra: sourcePulsesPerMatra,
    totalPulses: sourceValidation.total_pulses,
    parameters: input.source.parameters,
    segments: input.source.segments,
  });

  const cyclesToSearch = input.target.cycles
    ? [input.target.cycles]
    : Array.from({ length: 12 }, (_, index) => index + 1);

  const sourceRatios = computeParameterRatios(
    input.source.form,
    sourceComposition.parameters,
    sourceComposition.total_pulses,
  );

  const rankedChoices = cyclesToSearch
    .flatMap((cycles) =>
      listCandidateBuilds({
        matras: input.target.matras,
        form: input.source.form,
        jati: input.target.jati,
        cycles,
      }),
    )
    .map((candidate) =>
      rankTranspositionChoice(
        input.source.form,
        sourceComposition,
        sourceRatios,
        candidate,
        Boolean(input.target.cycles),
      ),
    )
    .sort(
      (a, b) =>
        a.score - b.score ||
        a.composition.cycles - b.composition.cycles ||
        a.candidate_score - b.candidate_score,
    );

  if (rankedChoices.length === 0) {
    throw new ToolError(
      'VALIDATION_FAILED',
      'No valid target composition could be found for the requested transposition',
      {
        form: input.source.form,
        target_jati: input.target.jati,
        target_cycles: input.target.cycles ?? null,
      },
    );
  }

  const [primary, ...rest] = rankedChoices;

  return {
    preserve_mode: preserveMode,
    source_validation: sourceValidation,
    source_composition: toCompositionBuildResult(sourceComposition),
    composition: primary.composition,
    scale_factor: primary.scale_factor,
    preservation_report: primary.preservation_report,
    alternatives: rest.slice(0, 4).map(toTranspositionChoice),
    warnings: buildTranspositionWarnings(sourceComposition, primary, Boolean(input.target.cycles)),
  };
}

export function validateComposition(params: {
  matras: number;
  form: CompositionForm;
  jati: Jati;
  cycles: number;
  parameters: CompositionParameters;
  segments?: CompositionSegment[];
}): CompositionValidationResult {
  const pulsesPerMatra = JATI_PULSES[params.jati];
  const totalPulses = params.matras * params.cycles * pulsesPerMatra;

  const P = params.parameters.P ?? 0;
  const G = params.parameters.G ?? 0;
  const M = params.parameters.M ?? 0;
  const g = params.parameters.g ?? 0;

  const expected = computeExpected(params.form, { P, G, M, g });
  const equation = expected === totalPulses;

  let segmentSum = true;
  let timelineContinuity = true;

  if (params.segments && params.segments.length > 0) {
    const sorted = [...params.segments].sort((a, b) => a.start_pulse - b.start_pulse);
    const sum = sorted.reduce((acc, s) => acc + s.length_pulses, 0);
    segmentSum = sum === totalPulses;

    const hasInvalidSegmentShape = sorted.some(
      (segment) =>
        segment.end_pulse < segment.start_pulse ||
        segment.length_pulses !== segment.end_pulse - segment.start_pulse + 1,
    );

    if (hasInvalidSegmentShape) {
      timelineContinuity = false;
    }

    if (
      timelineContinuity &&
      (sorted[0].start_pulse !== 1 || sorted[sorted.length - 1].end_pulse !== totalPulses)
    ) {
      timelineContinuity = false;
    }

    for (let i = 1; timelineContinuity && i < sorted.length; i += 1) {
      if (sorted[i].start_pulse !== sorted[i - 1].end_pulse + 1) {
        timelineContinuity = false;
        break;
      }
    }
  }

  const reasons: string[] = [];
  if (!equation) {
    reasons.push(`Equation mismatch: expected total ${expected}, got ${totalPulses}`);
  }
  if (!segmentSum) {
    reasons.push('Segment sum does not match total pulses');
  }
  if (!timelineContinuity) {
    reasons.push(`Segments are not contiguous or do not cover pulse range 1-${totalPulses}`);
  }

  return {
    is_valid: reasons.length === 0,
    reasons,
    total_pulses: totalPulses,
    checks: {
      equation,
      timeline_continuity: timelineContinuity,
      segment_sum: segmentSum,
    },
  };
}

function enumerateCandidates(form: CompositionForm, T: number, minUnit: number): Candidate[] {
  const candidates: Candidate[] = [];

  if (form === 'tihai') {
    for (let P = minUnit; P <= Math.floor(T / 3); P += 1) {
      const rem = T - 3 * P;
      if (rem < 0 || rem % 2 !== 0) {
        continue;
      }
      const G = rem / 2;
      candidates.push({ P, G, M: 0, g: 0, score: Math.abs(G - Math.floor(P / 2)) });
    }
    return candidates;
  }

  if (form === 'tukra') {
    for (let M = minUnit; M <= T; M += 1) {
      for (let P = minUnit; P <= Math.floor(T / 3); P += 1) {
        const rem = T - M - 3 * P;
        if (rem < 0 || rem % 2 !== 0) {
          continue;
        }
        const G = rem / 2;
        const score = Math.abs(M - P) + Math.abs(G - Math.floor(P / 3));
        candidates.push({ P, G, M, g: 0, score });
      }
    }
    return candidates;
  }

  for (let P = minUnit; P <= Math.floor(T / 9); P += 1) {
    for (let g = 0; g <= Math.floor(T / 6); g += 1) {
      const rem = T - 9 * P - 6 * g;
      if (rem < 0 || rem % 2 !== 0) {
        continue;
      }
      const G = rem / 2;
      const score = Math.abs(g - G);
      candidates.push({ P, G, M: 0, g, score });
    }
  }

  return candidates;
}

function listCandidateBuilds(input: CompositionBuildInput): ScoredCompositionBuildResult[] {
  const pulsesPerMatra = JATI_PULSES[input.jati];
  const totalPulses = input.matras * input.cycles * pulsesPerMatra;

  return enumerateCandidates(input.form, totalPulses, pulsesPerMatra)
    .sort((a, b) => a.score - b.score || a.P - b.P || a.G - b.G || a.M - b.M || a.g - b.g)
    .map((candidate) =>
      materializeComposition({
        form: input.form,
        cycles: input.cycles,
        pulsesPerMatra,
        totalPulses,
        parameters: candidate,
        candidateScore: candidate.score,
      }),
    );
}

function computeExpected(
  form: CompositionForm,
  params: { P: number; G: number; M: number; g: number },
): number {
  if (form === 'tihai') {
    return 3 * params.P + 2 * params.G;
  }
  if (form === 'tukra') {
    return params.M + 3 * params.P + 2 * params.G;
  }
  return 9 * params.P + 6 * params.g + 2 * params.G;
}

function detectForm(form: CompositionForm, params: Required<CompositionParameters>): string {
  if (form === 'tihai') {
    return params.G === 0 ? 'bedam' : 'damdar';
  }
  if (form === 'tukra') {
    return params.G === 0 ? 'bedam_ending' : 'damdar_ending';
  }

  if (params.g === 0 && params.G === 0) {
    return 'bedam';
  }
  if (params.g === params.G) {
    return 'simple_damdar';
  }
  return 'asymmetric';
}

function materializeComposition(params: {
  form: CompositionForm;
  cycles: number;
  pulsesPerMatra: number;
  totalPulses: number;
  parameters: CompositionParameters;
  segments?: CompositionSegment[];
  candidateScore?: number;
}): ScoredCompositionBuildResult {
  const normalizedParameters = normalizeParametersForForm(params.form, params.parameters);

  return {
    form: params.form,
    equation_template: equationTemplate(params.form),
    equation_instantiated: equationInstantiation(
      params.form,
      normalizedParameters,
      params.totalPulses,
    ),
    total_pulses: params.totalPulses,
    pulses_per_matra: params.pulsesPerMatra,
    cycles: params.cycles,
    parameters: normalizedParameters,
    detected_form: detectForm(params.form, normalizedParameters),
    segments:
      params.segments && params.segments.length > 0
        ? params.segments
        : buildSegments(params.form, normalizedParameters, params.pulsesPerMatra),
    candidate_score: params.candidateScore ?? 0,
  };
}

function toCompositionBuildResult(
  build: CompositionBuildResult | ScoredCompositionBuildResult,
): CompositionBuildResult {
  if (!('candidate_score' in build)) {
    return build;
  }

  const { candidate_score, ...result } = build;
  void candidate_score;
  return result;
}

function normalizeParametersForForm(
  form: CompositionForm,
  parameters: CompositionParameters,
): Required<CompositionParameters> {
  if (form === 'tihai') {
    return {
      P: parameters.P ?? 0,
      G: parameters.G ?? 0,
      M: 0,
      g: 0,
    };
  }

  if (form === 'tukra') {
    return {
      P: parameters.P ?? 0,
      G: parameters.G ?? 0,
      M: parameters.M ?? 0,
      g: 0,
    };
  }

  return {
    P: parameters.P ?? 0,
    G: parameters.G ?? 0,
    M: 0,
    g: parameters.g ?? 0,
  };
}

function relevantParameterKeys(
  form: CompositionForm,
): Array<keyof Required<CompositionParameters>> {
  if (form === 'tihai') {
    return ['P', 'G'];
  }
  if (form === 'tukra') {
    return ['M', 'P', 'G'];
  }
  return ['P', 'g', 'G'];
}

function computeParameterRatios(
  form: CompositionForm,
  parameters: Required<CompositionParameters>,
  totalPulses: number,
): Record<string, number> {
  return relevantParameterKeys(form).reduce<Record<string, number>>((acc, key) => {
    acc[key] = roundMetric(parameters[key] / Math.max(1, totalPulses));
    return acc;
  }, {});
}

function rankTranspositionChoice(
  form: CompositionForm,
  sourceComposition: ScoredCompositionBuildResult,
  sourceRatios: Record<string, number>,
  candidate: ScoredCompositionBuildResult,
  exactCyclesRequested: boolean,
): RankedTranspositionChoice {
  const candidateRatios = computeParameterRatios(
    form,
    candidate.parameters,
    candidate.total_pulses,
  );
  const parameterRatioDeltas = relevantParameterKeys(form).reduce<Record<string, number>>(
    (acc, key) => {
      acc[key] = roundMetric(Math.abs((sourceRatios[key] ?? 0) - (candidateRatios[key] ?? 0)));
      return acc;
    },
    {},
  );

  const ratioDistance = roundMetric(
    Object.values(parameterRatioDeltas).reduce((sum, delta) => sum + delta, 0),
  );
  const subtypePenalty = candidate.detected_form === sourceComposition.detected_form ? 0 : 0.35;
  const cyclePenalty = exactCyclesRequested ? 0 : Math.max(0, candidate.cycles - 1) * 0.01;
  const heuristicPenalty =
    roundMetric(candidate.candidate_score / Math.max(1, candidate.total_pulses)) * 0.001;

  return {
    score: roundMetric(ratioDistance + subtypePenalty + cyclePenalty + heuristicPenalty),
    scale_factor: roundMetric(candidate.total_pulses / Math.max(1, sourceComposition.total_pulses)),
    composition: toCompositionBuildResult(candidate),
    preservation_report: {
      source_detected_form: sourceComposition.detected_form,
      target_detected_form: candidate.detected_form,
      exact_subtype_match: sourceComposition.detected_form === candidate.detected_form,
      ratio_distance: ratioDistance,
      parameter_ratio_deltas: parameterRatioDeltas,
    },
    candidate_score: candidate.candidate_score,
  };
}

function toTranspositionChoice(choice: RankedTranspositionChoice): CompositionTranspositionChoice {
  const { candidate_score, ...result } = choice;
  void candidate_score;
  return result;
}

function buildTranspositionWarnings(
  sourceComposition: CompositionBuildResult,
  choice: RankedTranspositionChoice,
  exactCyclesRequested: boolean,
): string[] {
  const warnings: string[] = [];

  if (!choice.preservation_report.exact_subtype_match) {
    warnings.push(
      `Subtype changed from ${choice.preservation_report.source_detected_form} to ${choice.preservation_report.target_detected_form} to keep the target composition valid.`,
    );
  }

  if (!exactCyclesRequested && choice.composition.cycles !== sourceComposition.cycles) {
    warnings.push(
      `Selected ${choice.composition.cycles} target cycle(s) instead of source ${sourceComposition.cycles} cycle(s) for the closest structural fit.`,
    );
  }

  if (choice.preservation_report.ratio_distance > 0.15) {
    warnings.push(
      'Relative phrase and gap proportions shifted materially to preserve a valid landing on sam in the target context.',
    );
  }

  return warnings;
}

function buildSegments(
  form: CompositionForm,
  params: Required<CompositionParameters>,
  pulsesPerMatra: number,
): CompositionSegment[] {
  const segments: CompositionSegment[] = [];
  let cursor = 1;

  const addSegment = (
    kind: CompositionSegment['kind'],
    index: number,
    roundIndex: number,
    length: number,
  ) => {
    if (length <= 0) {
      return;
    }
    const start = cursor;
    const end = start + length - 1;
    segments.push({
      kind,
      index,
      round_index: roundIndex,
      start_pulse: start,
      end_pulse: end,
      length_pulses: length,
      start_beat: pulseToBeat(start, pulsesPerMatra),
      end_beat: pulseToBeat(end + 1, pulsesPerMatra),
      length_beats: length / pulsesPerMatra,
    });
    cursor = end + 1;
  };

  if (form === 'tihai') {
    for (let i = 1; i <= 3; i += 1) {
      addSegment('phrase', i, 0, params.P);
      if (i < 3 && params.G > 0) {
        addSegment('gap', i, 0, params.G);
      }
    }
    return segments;
  }

  if (form === 'tukra') {
    addSegment('mukhra', 1, 0, params.M);
    for (let i = 1; i <= 3; i += 1) {
      addSegment('phrase', i, 0, params.P);
      if (i < 3 && params.G > 0) {
        addSegment('gap', i, 0, params.G);
      }
    }
    return segments;
  }

  for (let round = 1; round <= 3; round += 1) {
    for (let phrase = 1; phrase <= 3; phrase += 1) {
      addSegment('phrase', phrase, round, params.P);
      if (phrase < 3 && params.g > 0) {
        addSegment('gap', phrase, round, params.g);
      }
    }
    if (round < 3 && params.G > 0) {
      addSegment('macro_gap', round, round, params.G);
    }
  }

  return segments;
}

function equationTemplate(form: CompositionForm): string {
  if (form === 'tihai') {
    return '3P + 2G = T';
  }
  if (form === 'tukra') {
    return 'M + 3P + 2G = T';
  }
  return '9P + 6g + 2G = T';
}

function equationInstantiation(
  form: CompositionForm,
  params: Required<CompositionParameters>,
  T: number,
): string {
  if (form === 'tihai') {
    return `3×${params.P} + 2×${params.G} = ${T}`;
  }
  if (form === 'tukra') {
    return `${params.M} + 3×${params.P} + 2×${params.G} = ${T}`;
  }
  return `9×${params.P} + 6×${params.g} + 2×${params.G} = ${T}`;
}

function pulseToBeat(pulse: number, pulsesPerMatra: number): number {
  return Number(((pulse - 1) / pulsesPerMatra + 1).toFixed(3));
}

function roundMetric(value: number): number {
  return Number(value.toFixed(6));
}
