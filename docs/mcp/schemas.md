# Schemas

## Input schemas

- `src/schemas/tool_input/glossary_lookup.json`
- `src/schemas/tool_input/compose_builder.json`
- `src/schemas/tool_input/certification_catalog.json`
- `src/schemas/tool_input/assessment_builder.json`
- `src/schemas/tool_input/practice_coach.json`
- `src/schemas/tool_input/taal_catalog.json`
- `src/schemas/tool_input/composition_validator.json`
- `src/schemas/tool_input/explain_taal.json`

## Output envelope schema

- `src/schemas/tool_output/common_envelope.json`

## Resource payload schema

Resources use a shared JSON envelope shape:

- `version`
- `generated_at`
- `source`
- `data`

Resource-specific payload fields are documented in `docs/mcp/resources.md`.

## Prompt argument contracts

Prompt argument names and semantics are documented in `docs/mcp/prompts.md`.

## Compatibility policy

All schema changes follow semantic versioning rules defined in `docs/mcp/versioning-policy.md`.
