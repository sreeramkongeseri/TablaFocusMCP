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

  it('normalizes chakradar alias', () => {
    expect(normalizeCompositionForm('chakradar')).toBe('chakradhar');
  });
});
