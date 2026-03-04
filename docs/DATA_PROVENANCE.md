# Data Provenance

## Scope

TablaFocusMCP uses two dataset classes:

1. Open sample datasets committed to this repository (`data/samples`).
2. Optional private datasets imported locally by end users (`data/private/raw`).

## Repository-committed datasets

### `data/samples/glossary.json`

- Purpose: glossary lookup tool examples and tests.
- Source type: repository-authored sample content.
- License status: covered under repository MIT terms.
- Last review date: 2026-03-04.

### `data/samples/talas.json`

- Purpose: taal catalog/explain tools, composition demos.
- Source type: repository-authored sample content.
- License status: covered under repository MIT terms.
- Last review date: 2026-03-04.

### `data/samples/quiz_bank.json`

- Purpose: assessment and certification catalog sample generation.
- Source type: repository-authored sample taxonomy/questions.
- License status: covered under repository MIT terms.
- Last review date: 2026-03-04.

### `data/curated/certification_boards.json`

- Purpose: board metadata and reference links used by `certification_catalog`.
- Source type: repository-curated metadata.
- License status: covered under repository MIT terms.
- Last review date: 2026-03-04.

### `data/curated/website_articles.json`

- Purpose: curated article metadata index for richer tabla context derived from the Tabla Focus website API.
- Source type: generated from `https://www.tablafocus.com/api/ios/articles` and per-article detail endpoints.
- Generator: `scripts/sync-webpage-content.mjs`.
- License status: metadata curated and published by Tabla Focus project maintainers.
- Last review date: 2026-03-04.

## Private local imports

The helper script [`scripts/sync_from_tablafocus.sh`](../scripts/sync_from_tablafocus.sh) imports external app exports into `data/private/raw` by default.

- These files are not required for repository operation.
- Imported files are user-supplied and remain the user's responsibility for license/compliance.
- Do not commit private imports to public repositories.

## Verification policy

- Tool responses include `source`, `coverage_status`, and `confidence` fields.
- Metadata references should be reviewed each release.
- If provenance is uncertain, mark `coverage_status` as `partial` or `sparse` and disclose limitations.
- Curated website metadata freshness can be checked via `npm run content:check:freshness`.
