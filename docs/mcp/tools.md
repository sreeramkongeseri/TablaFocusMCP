# MCP Tool List

All tools return a common envelope:

- `meta`: tool metadata (`coverage_status`, `confidence`, `source`, `last_verified_at`)
- `data`: tool-specific payload

## 1) glossary_lookup

Purpose: lookup terms from the configured glossary dataset.

Input schema: `src/schemas/tool_input/glossary_lookup.json`

Example call:

```json
{
  "term": "sam",
  "limit": 5
}
```

## 2) compose_builder

Purpose: build deterministic valid `tihai`, `tukra`, `chakradhar` layouts.

Input schema: `src/schemas/tool_input/compose_builder.json`

Example call:

```json
{
  "taal": "teental",
  "form": "tihai",
  "jati": "chatusra",
  "cycles": 1
}
```

## 3) certification_catalog

Purpose: catalog certification tracks by board and level.

Input schema: `src/schemas/tool_input/certification_catalog.json`

## 4) assessment_builder

Purpose: build `practice_quiz` or `cert_mock` with answer key and rubric.

Input schema: `src/schemas/tool_input/assessment_builder.json`

Notes:

- `mode` is required.
- `count` is optional (defaults to `10`).

Example call:

```json
{
  "mode": "cert_mock",
  "board": "ABGMVM",
  "certification_level": "MADHYAMA_PRATHAM",
  "count": 20
}
```

## 5) practice_coach

Purpose: generate practical adaptive weekly plan from realistic availability.

Input schema: `src/schemas/tool_input/practice_coach.json`

## 6) taal_catalog

Purpose: full taal catalog or per-taal detail.

Input schema: `src/schemas/tool_input/taal_catalog.json`

## 7) composition_validator

Purpose: validate user-entered composition equation and timeline.

Input schema: `src/schemas/tool_input/composition_validator.json`

## 8) explain_taal (compatibility)

Purpose: compatibility alias for clients expecting `explain_taal`; uses canonical `taal_catalog` details.

Input schema: `src/schemas/tool_input/explain_taal.json`
