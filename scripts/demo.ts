import path from 'node:path';
import { ContentStore } from '../src/data/contentStore.js';
import { buildComposition } from '../src/engines/compositionRuleEngine.js';
import { buildPracticePlan } from '../src/engines/practiceEngine.js';

async function main() {
  const store = new ContentStore({
    dataDir: path.resolve(process.cwd(), 'data', 'samples'),
    curatedDataDir: path.resolve(process.cwd(), 'data', 'curated'),
    rateLimitPerMinute: 120,
    deterministic: true,
    logLevel: 'info',
  });

  await store.load();

  const glossary = store.getGlossary({ term: 'sam', limit: 3 });
  const teental = store.getTaalById('teental');

  const composition = buildComposition({
    matras: teental?.matras ?? 16,
    form: 'tihai',
    jati: 'chatusra',
    cycles: 1,
  });

  const practice = buildPracticePlan({
    goals: ['steady sam landing', 'jhaptal clarity'],
    availability: { daily_minutes: 30, days_per_week: 5 },
    weekContext: { missed_days: 1, fatigue: 'medium', completed_minutes: 120 },
  });

  console.log('=== TablaFocusMCP Demo ===');
  console.log('\nGlossary sample:\n', JSON.stringify(glossary, null, 2));
  console.log('\nTeental matras:', teental?.matras);
  console.log('\nTihai composition:\n', JSON.stringify(composition, null, 2));
  console.log('\nPractice plan:\n', JSON.stringify(practice, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
