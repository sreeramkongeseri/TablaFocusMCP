import { describe, expect, it } from 'vitest';
import {
  buildComposition,
  normalizeCompositionForm,
  validateComposition,
} from '../../src/engines/compositionRuleEngine.js';

describe('compositionRuleEngine', () => {
  it('builds valid tihai equation', () => {
    const result = buildComposition({
      matras: 16,
      form: 'tihai',
      jati: 'chatusra',
      cycles: 1,
    });

    const { P, G } = result.parameters;
    expect(3 * P + 2 * G).toBe(result.total_pulses);
    expect(result.equation_template).toBe('3P + 2G = T');
  });

  it('builds valid tukra equation', () => {
    const result = buildComposition({
      matras: 16,
      form: 'tukra',
      jati: 'chatusra',
      cycles: 1,
    });

    const { M, P, G } = result.parameters;
    expect(M + 3 * P + 2 * G).toBe(result.total_pulses);
    expect(result.equation_template).toBe('M + 3P + 2G = T');
  });

  it('builds valid chakradhar equation', () => {
    const result = buildComposition({
      matras: 16,
      form: 'chakradhar',
      jati: 'chatusra',
      cycles: 1,
    });

    const { P, g, G } = result.parameters;
    expect(9 * P + 6 * g + 2 * G).toBe(result.total_pulses);
    expect(result.equation_template).toBe('9P + 6g + 2G = T');
  });

  it('validates equation mismatch', () => {
    const validation = validateComposition({
      matras: 16,
      form: 'tihai',
      jati: 'chatusra',
      cycles: 1,
      parameters: { P: 2, G: 2 },
    });

    expect(validation.is_valid).toBe(false);
    expect(validation.checks.equation).toBe(false);
  });

  it('rejects segment timelines that do not cover pulse range 1..T', () => {
    const validation = validateComposition({
      matras: 16,
      form: 'tihai',
      jati: 'chatusra',
      cycles: 1,
      parameters: { P: 20, G: 2 },
      segments: [
        {
          kind: 'phrase',
          index: 1,
          round_index: 0,
          start_pulse: 2,
          end_pulse: 33,
          length_pulses: 32,
          start_beat: 1.25,
          end_beat: 9.25,
          length_beats: 8,
        },
        {
          kind: 'phrase',
          index: 2,
          round_index: 0,
          start_pulse: 34,
          end_pulse: 65,
          length_pulses: 32,
          start_beat: 9.25,
          end_beat: 17.25,
          length_beats: 8,
        },
      ],
    });

    expect(validation.is_valid).toBe(false);
    expect(validation.checks.equation).toBe(true);
    expect(validation.checks.segment_sum).toBe(true);
    expect(validation.checks.timeline_continuity).toBe(false);
  });

  it('rejects segments with inconsistent start/end vs length', () => {
    const validation = validateComposition({
      matras: 16,
      form: 'tihai',
      jati: 'chatusra',
      cycles: 1,
      parameters: { P: 20, G: 2 },
      segments: [
        {
          kind: 'phrase',
          index: 1,
          round_index: 0,
          start_pulse: 1,
          end_pulse: 10,
          length_pulses: 20,
          start_beat: 1,
          end_beat: 3.5,
          length_beats: 5,
        },
        {
          kind: 'phrase',
          index: 2,
          round_index: 0,
          start_pulse: 11,
          end_pulse: 64,
          length_pulses: 44,
          start_beat: 3.5,
          end_beat: 17,
          length_beats: 11,
        },
      ],
    });

    expect(validation.is_valid).toBe(false);
    expect(validation.checks.equation).toBe(true);
    expect(validation.checks.segment_sum).toBe(true);
    expect(validation.checks.timeline_continuity).toBe(false);
  });

  it('normalizes chakradar alias', () => {
    expect(normalizeCompositionForm('chakradar')).toBe('chakradhar');
  });

  it('normalizes spacing variants for chakradhar', () => {
    expect(normalizeCompositionForm('chakra dhar')).toBe('chakradhar');
    expect(normalizeCompositionForm('chakra-dar')).toBe('chakradhar');
  });
});
