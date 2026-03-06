# Architecture

## Runtime flow

1. `src/index.ts` loads configuration and starts MCP stdio transport.
2. `src/server.ts` registers MCP resources, prompts, and tools.
3. Resource and tool handlers call `ContentStore` + domain engines.
4. Tool responses are wrapped in common envelope (`meta` + `data`).

## Core components

- `src/config.ts`: environment-backed runtime configuration.
- `src/data/contentStore.ts`: data loading, normalization, and query APIs.
- `src/engines/*`: deterministic business logic.
- `src/resources/*`: MCP resource registration and dataset payload contracts.
- `src/prompts/*`: MCP prompt templates for guided workflows.
- `src/tools/*`: MCP tool input validation + response contracts.
- `src/toolRuntime.ts`: success/error envelopes + guard wrapper.
- `src/rateLimiter.ts`: per-tool in-memory throttling.

## Data layers

- `data/samples/*`: default open sample content.
- `data/curated/*`: board metadata + references.
- `scripts/sync-webpage-content.mjs`: syncs website article metadata into `data/curated/website_articles.json`.
- `data/private/raw/*`: optional local imports (not for publication).

## Tool families

- Reference tools: `glossary_lookup`, `taal_catalog`, `explain_taal`.
- Composition tools: `compose_builder`, `composition_transposer`, `composition_validator`.
- Curriculum/assessment tools: `certification_catalog`, `assessment_builder`.
- Planning tool: `practice_coach`.

## MCP primitives

- Resources: `tabla://glossary`, `tabla://taals`, `tabla://certification-boards`,
  `tabla://certification-level-summaries`.
- Prompts: `cert_prep_plan`, `weekly_practice_reset`.
- Tools: deterministic action layer for computation, validation, and planning.

## Contract stability

- Input schema files under `src/schemas/tool_input/` are the contract source of truth.
- Output always follows `src/schemas/tool_output/common_envelope.json`.
- Breaking contract changes require major version increments.
