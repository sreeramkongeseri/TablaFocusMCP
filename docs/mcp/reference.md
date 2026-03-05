# MCP Reference

This page is the consolidated reference for tools, resources, prompts, schemas, errors, rate limits, and compatibility policy.

## Contracts

### Tool response envelope

All tools return:

- `meta`: tool metadata (`coverage_status`, `confidence`, `source`, `last_verified_at`)
- `data`: tool-specific payload

### Error model

Errors return:

```json
{
  "code": "INVALID_INPUT | NOT_FOUND | VALIDATION_FAILED | COVERAGE_GAP | RATE_LIMITED | INTERNAL_ERROR",
  "message": "human-readable message",
  "details": {}
}
```

Error codes:

- `INVALID_INPUT`: malformed or missing required fields
- `NOT_FOUND`: requested item does not exist
- `VALIDATION_FAILED`: composition math or invariants failed
- `COVERAGE_GAP`: data missing for requested operation
- `RATE_LIMITED`: per-tool quota exceeded
- `INTERNAL_ERROR`: unexpected server failure

### Rate limits

- Default: `120 calls/minute` per tool name
- Configure with: `TABLA_MCP_RATE_LIMIT_PER_MINUTE`

### Compatibility policy

Semantic versioning is used:

- `MAJOR`: breaking contract changes
- `MINOR`: backward-compatible feature additions
- `PATCH`: backward-compatible fixes

Tool contract policy:

1. Existing required fields are not removed in minor/patch releases.
2. New optional fields may be added in minor releases.
3. Renames/removals require a major release and migration notes in `CHANGELOG.md`.
4. Aliases may be accepted for compatibility (example: `chakradar` -> `chakradhar`).

## Tools

| Tool | Purpose | Input schema |
| --- | --- | --- |
| `glossary_lookup` | Lookup terms from the glossary dataset | `src/schemas/tool_input/glossary_lookup.json` |
| `compose_builder` | Build valid deterministic `tihai`, `tukra`, `chakradhar` layouts | `src/schemas/tool_input/compose_builder.json` |
| `certification_catalog` | Catalog certification tracks by board and level | `src/schemas/tool_input/certification_catalog.json` |
| `assessment_builder` | Build `practice_quiz` or `cert_mock` with answer key and rubric | `src/schemas/tool_input/assessment_builder.json` |
| `practice_coach` | Generate adaptive weekly practice plans | `src/schemas/tool_input/practice_coach.json` |
| `taal_catalog` | Return full taal catalog or per-taal detail | `src/schemas/tool_input/taal_catalog.json` |
| `composition_validator` | Validate composition equation and timeline | `src/schemas/tool_input/composition_validator.json` |
| `explain_taal` | Compatibility alias for clients expecting `explain_taal` | `src/schemas/tool_input/explain_taal.json` |

## Resources

Resource envelope fields:

- `version`
- `generated_at`
- `source`
- `data`

| Resource URI | Purpose | Key payload fields |
| --- | --- | --- |
| `tabla://glossary` | Expose full glossary dataset | `data.total_entries`, `data.categories`, `data.entries` |
| `tabla://taals` | Expose normalized taal catalog | `data.total_taals`, `data.taals` |
| `tabla://certification-boards` | Expose curated board metadata and references | `data.total_boards`, `data.boards` |
| `tabla://certification-level-summaries` | Expose question-bank-derived board/level summaries | `data.total_levels`, `data.summaries` |

## Prompts

| Prompt | Purpose | Required arguments |
| --- | --- | --- |
| `cert_prep_plan` | Certification prep workflow (`catalog` -> `mock` -> `plan`) | `board`, `certification_level`, `days_per_week`, `minutes_per_day` |
| `weekly_practice_reset` | Rebuild a weekly plan after misses/fatigue | `goals`, `daily_minutes`, `days_per_week` |
| `exam_week_plan` | Focused 7-day prep workflow | `board`, `certification_level`, `daily_minutes` |
| `missed_week_recovery` | Recovery workflow after disrupted week | `goals`, `daily_minutes`, `days_per_week` |
| `composition_polish` | Iterative draft -> validate -> refine composition flow | `taal`, `form`, `jati` |

## Schemas

Input schemas:

- `src/schemas/tool_input/glossary_lookup.json`
- `src/schemas/tool_input/compose_builder.json`
- `src/schemas/tool_input/certification_catalog.json`
- `src/schemas/tool_input/assessment_builder.json`
- `src/schemas/tool_input/practice_coach.json`
- `src/schemas/tool_input/taal_catalog.json`
- `src/schemas/tool_input/composition_validator.json`
- `src/schemas/tool_input/explain_taal.json`

Output envelope schema:

- `src/schemas/tool_output/common_envelope.json`

## Detailed Pages

For expanded, section-specific detail:

- `docs/mcp/tools.md`
- `docs/mcp/resources.md`
- `docs/mcp/prompts.md`
- `docs/mcp/schemas.md`
- `docs/mcp/error-model.md`
- `docs/mcp/rate-limits.md`
- `docs/mcp/versioning-policy.md`
