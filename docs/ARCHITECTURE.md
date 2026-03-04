# Architecture

## Runtime flow

1. `src/index.ts` loads configuration and starts MCP stdio transport.
2. `src/server.ts` registers tool handlers.
3. Tool handlers call `ContentStore` + domain engines.
4. Responses are wrapped in common envelope (`meta` + `data`).

## Core components

- `src/config.ts`: environment-backed runtime configuration.
- `src/data/contentStore.ts`: data loading, normalization, and query APIs.
- `src/engines/*`: deterministic business logic.
- `src/tools/*`: MCP tool input validation + response contracts.
- `src/toolRuntime.ts`: success/error envelopes + guard wrapper.
- `src/rateLimiter.ts`: per-tool in-memory throttling.

## Data layers

- `data/samples/*`: default open sample content.
- `data/curated/*`: board metadata + references.
- `data/private/raw/*`: optional local imports (not for publication).

## Tool families

- Reference tools: `glossary_lookup`, `taal_catalog`, `explain_taal`.
- Composition tools: `compose_builder`, `composition_validator`.
- Curriculum/assessment tools: `certification_catalog`, `assessment_builder`.
- Planning tool: `practice_coach`.

## Contract stability

- Input schema files under `src/schemas/tool_input/` are the contract source of truth.
- Output always follows `src/schemas/tool_output/common_envelope.json`.
- Breaking contract changes require major version increments.
