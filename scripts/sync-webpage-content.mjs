import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const DEFAULT_BASE_URL = 'https://www.tablafocus.com';
const DEFAULT_OUTPUT_PATH = path.resolve(process.cwd(), 'data', 'curated', 'website_articles.json');
const DEFAULT_TIMEOUT_MS = 20000;
const DEFAULT_CONCURRENCY = 6;

function parseArgs(argv) {
  const options = {
    baseUrl: process.env.TABLA_MCP_SOURCE_BASE_URL ?? DEFAULT_BASE_URL,
    outputPath: process.env.TABLA_MCP_CURATED_OUTPUT_PATH ?? DEFAULT_OUTPUT_PATH,
    checkOnly: false,
    timeoutMs: DEFAULT_TIMEOUT_MS,
    concurrency: DEFAULT_CONCURRENCY,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--check') {
      options.checkOnly = true;
      continue;
    }
    if (arg === '--base-url') {
      options.baseUrl = argv[index + 1] ?? '';
      index += 1;
      continue;
    }
    if (arg === '--output') {
      options.outputPath = path.resolve(argv[index + 1] ?? '');
      index += 1;
      continue;
    }
    if (arg === '--timeout-ms') {
      options.timeoutMs = Number(argv[index + 1] ?? '');
      index += 1;
      continue;
    }
    if (arg === '--concurrency') {
      options.concurrency = Number(argv[index + 1] ?? '');
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!Number.isFinite(options.timeoutMs) || options.timeoutMs <= 0) {
    throw new Error('timeout-ms must be a positive number.');
  }

  if (
    !Number.isFinite(options.concurrency) ||
    options.concurrency <= 0 ||
    !Number.isInteger(options.concurrency)
  ) {
    throw new Error('concurrency must be a positive integer.');
  }

  const parsedBaseUrl = new globalThis.URL(options.baseUrl);
  options.baseUrl = parsedBaseUrl.toString().replace(/\/$/, '');

  return options;
}

function sha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

function countWords(input) {
  return input.trim().split(/\s+/).filter(Boolean).length;
}

function summarizeContent(input) {
  const flattened = input.replace(/\s+/g, ' ').trim();
  if (!flattened) {
    return '';
  }
  const maxLength = 240;
  if (flattened.length <= maxLength) {
    return flattened;
  }
  return `${flattened.slice(0, maxLength - 1).trimEnd()}…`;
}

function normalizeStringArray(values) {
  return [
    ...new Set(
      values
        .filter((value) => typeof value === 'string')
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  ].sort((a, b) => a.localeCompare(b));
}

async function fetchJson(url, timeoutMs) {
  const response = await globalThis.fetch(url, {
    headers: {
      Accept: 'application/json',
    },
    signal: globalThis.AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${url}`);
  }

  return response.json();
}

function assertListEnvelope(payload, url) {
  if (!payload || typeof payload !== 'object') {
    throw new Error(`Unexpected response shape from ${url}`);
  }
  if (!Array.isArray(payload.data)) {
    throw new Error(`Missing data[] payload from ${url}`);
  }
}

function assertDetailEnvelope(payload, url) {
  if (!payload || typeof payload !== 'object') {
    throw new Error(`Unexpected response shape from ${url}`);
  }
  if (!payload.data || typeof payload.data !== 'object') {
    throw new Error(`Missing data object payload from ${url}`);
  }
}

async function mapWithConcurrency(items, concurrency, mapper) {
  const results = new Array(items.length);
  let currentIndex = 0;

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, async () => {
      while (true) {
        const index = currentIndex;
        currentIndex += 1;
        if (index >= items.length) {
          return;
        }
        results[index] = await mapper(items[index], index);
      }
    }),
  );

  return results;
}

function normalizeArticleRecord(item, detail, baseUrl, detailUrl) {
  const content = typeof detail.content === 'string' ? detail.content.trim() : '';
  const category = typeof item.category === 'string' ? item.category.trim() : '';
  const slug = typeof item.crawlableTitle === 'string' ? item.crawlableTitle.trim() : '';

  const headings = Array.isArray(detail.headings)
    ? detail.headings
        .filter((heading) => heading && typeof heading === 'object')
        .map((heading) => ({
          level: heading.level === 2 || heading.level === 3 ? heading.level : 2,
          id: typeof heading.id === 'string' ? heading.id.trim() : '',
          text: typeof heading.text === 'string' ? heading.text.trim() : '',
        }))
        .filter((heading) => heading.id && heading.text)
    : [];

  return {
    article_id: `${category}/${slug}`,
    category,
    category_name: typeof item.categoryName === 'string' ? item.categoryName.trim() : '',
    slug,
    title: typeof item.displayTitle === 'string' ? item.displayTitle.trim() : '',
    summary: typeof item.summary === 'string' ? item.summary.trim() : '',
    author: typeof item.author === 'string' ? item.author.trim() : '',
    last_updated: typeof item.lastUpdated === 'string' ? item.lastUpdated.trim() : '',
    reading_time_minutes:
      Number.isFinite(item.readingTime) && item.readingTime > 0 ? item.readingTime : 1,
    tags: normalizeStringArray(item.tags ?? []),
    related_articles: normalizeStringArray(item.relatedArticles ?? []),
    glossary_terms: normalizeStringArray(detail.glossaryTerms ?? []),
    sources: normalizeStringArray(detail.sources ?? []),
    headings,
    article_url: `${baseUrl}/learn/${encodeURIComponent(category)}/${encodeURIComponent(slug)}`,
    api_detail_url: detailUrl,
    content_metrics: {
      word_count: countWords(content),
      char_count: content.length,
      sha256: sha256(content),
      preview: summarizeContent(content),
    },
  };
}

function buildIndexes(articles) {
  const categoryCounts = new Map();
  const glossaryTerms = new Map();
  const sourceCounts = new Map();

  for (const article of articles) {
    categoryCounts.set(article.category, (categoryCounts.get(article.category) ?? 0) + 1);

    for (const term of article.glossary_terms) {
      const normalizedTerm = term.toLowerCase();
      if (!glossaryTerms.has(normalizedTerm)) {
        glossaryTerms.set(normalizedTerm, {
          term,
          normalized_term: normalizedTerm,
          article_ids: [],
        });
      }
      glossaryTerms.get(normalizedTerm).article_ids.push(article.article_id);
    }

    for (const source of article.sources) {
      if (!sourceCounts.has(source)) {
        sourceCounts.set(source, []);
      }
      sourceCounts.get(source).push(article.article_id);
    }
  }

  const categories = [...categoryCounts.entries()]
    .map(([category, article_count]) => ({ category, article_count }))
    .sort((a, b) => a.category.localeCompare(b.category));

  const glossary_index = [...glossaryTerms.values()]
    .map((termRecord) => ({
      ...termRecord,
      article_ids: [...new Set(termRecord.article_ids)].sort((a, b) => a.localeCompare(b)),
      article_count: [...new Set(termRecord.article_ids)].length,
    }))
    .sort((a, b) => a.normalized_term.localeCompare(b.normalized_term));

  const source_index = [...sourceCounts.entries()]
    .map(([source, articleIds]) => ({
      source,
      article_ids: [...new Set(articleIds)].sort((a, b) => a.localeCompare(b)),
      article_count: [...new Set(articleIds)].length,
    }))
    .sort((a, b) => b.article_count - a.article_count || a.source.localeCompare(b.source));

  return {
    categories,
    glossary_index,
    source_index,
  };
}

function buildCuratedPayload(baseUrl, articles) {
  const sortedArticles = [...articles].sort(
    (a, b) => a.category.localeCompare(b.category) || a.slug.localeCompare(b.slug),
  );

  const indexes = buildIndexes(sortedArticles);

  return {
    schema_version: '1.0.0',
    source: {
      website_base_url: baseUrl,
      article_list_api: '/api/ios/articles',
      article_detail_api_template: '/api/ios/articles/{category}/{slug}',
      article_page_template: '/learn/{category}/{slug}',
    },
    generated_by: 'scripts/sync-webpage-content.mjs',
    article_count: sortedArticles.length,
    indexes,
    articles: sortedArticles,
  };
}

function summarizeIdDiff(oldPayload, nextPayload) {
  const oldIds = new Set((oldPayload.articles ?? []).map((item) => item.article_id));
  const nextIds = new Set((nextPayload.articles ?? []).map((item) => item.article_id));

  const added = [...nextIds].filter((id) => !oldIds.has(id)).sort((a, b) => a.localeCompare(b));
  const removed = [...oldIds].filter((id) => !nextIds.has(id)).sort((a, b) => a.localeCompare(b));

  return { added, removed };
}

async function readFileIfExists(filePath) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (error) {
    if (error && typeof error === 'object' && error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  const listUrl = `${options.baseUrl}/api/ios/articles`;
  const listEnvelope = await fetchJson(listUrl, options.timeoutMs);
  assertListEnvelope(listEnvelope, listUrl);

  const articleList = listEnvelope.data;
  const details = await mapWithConcurrency(articleList, options.concurrency, async (item) => {
    const category = encodeURIComponent(item.category ?? '');
    const slug = encodeURIComponent(item.crawlableTitle ?? '');
    const detailUrl = `${options.baseUrl}/api/ios/articles/${category}/${slug}`;
    const detailEnvelope = await fetchJson(detailUrl, options.timeoutMs);
    assertDetailEnvelope(detailEnvelope, detailUrl);
    return normalizeArticleRecord(item, detailEnvelope.data, options.baseUrl, detailUrl);
  });

  const payload = buildCuratedPayload(options.baseUrl, details);
  const nextJson = `${JSON.stringify(payload, null, 2)}\n`;

  const currentJson = await readFileIfExists(options.outputPath);
  const hasChanges = currentJson !== nextJson;

  if (options.checkOnly) {
    if (!hasChanges) {
      process.stdout.write(
        `Freshness check passed. Curated content is up to date (${payload.article_count} articles).\n`,
      );
      return;
    }

    const oldPayload = currentJson ? JSON.parse(currentJson) : { articles: [] };
    const diff = summarizeIdDiff(oldPayload, payload);

    process.stderr.write('Freshness check failed. Curated content is stale.\n');
    process.stderr.write(
      `Run: node scripts/sync-webpage-content.mjs --base-url ${options.baseUrl}\n`,
    );
    process.stderr.write(
      `Added articles: ${diff.added.length}, removed articles: ${diff.removed.length}\n`,
    );
    if (diff.added.length > 0) {
      process.stderr.write(`Added: ${diff.added.join(', ')}\n`);
    }
    if (diff.removed.length > 0) {
      process.stderr.write(`Removed: ${diff.removed.join(', ')}\n`);
    }
    process.exit(1);
  }

  await fs.mkdir(path.dirname(options.outputPath), { recursive: true });
  await fs.writeFile(options.outputPath, nextJson, 'utf8');

  if (hasChanges) {
    process.stdout.write(
      `Curated content synced: ${payload.article_count} articles written to ${options.outputPath}\n`,
    );
  } else {
    process.stdout.write(
      `No content changes detected. ${options.outputPath} is already current.\n`,
    );
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`Content sync failed: ${message}\n`);
  process.exit(1);
});
