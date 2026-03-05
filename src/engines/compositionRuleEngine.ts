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

interface Candidate {
  P: number;
  G: number;
  M: number;
  g: number;
  score: number;
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
  const pulsesPerMatra = JATI_PULSES[input.jati];
  const totalPulses = input.matras * input.cycles * pulsesPerMatra;

  const candidates = enumerateCandidates(input.form, totalPulses, pulsesPerMatra);
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

  candidates.sort((a, b) => a.score - b.score || a.P - b.P || a.G - b.G);
  const best = candidates[0];

  const parameters: Required<CompositionParameters> = {
    P: best.P,
    G: best.G,
    M: best.M,
    g: best.g,
  };

  const segments = buildSegments(input.form, parameters, pulsesPerMatra);

  return {
    form: input.form,
    equation_template: equationTemplate(input.form),
    equation_instantiated: equationInstantiation(input.form, parameters, totalPulses),
    total_pulses: totalPulses,
    pulses_per_matra: pulsesPerMatra,
    cycles: input.cycles,
    parameters,
    detected_form: detectForm(input.form, parameters),
    segments,
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
