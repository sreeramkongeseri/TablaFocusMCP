# MCP Tool List

For MCP resources and prompts, see `docs/mcp/resources.md` and `docs/mcp/prompts.md`.

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

## 3) composition_transposer

Purpose: transpose a valid `tihai`, `tukra`, or `chakradhar` into a new taal/jati context while preserving structural ratios as closely as possible.

Input schema: `src/schemas/tool_input/composition_transposer.json`

Example call:

```json
{
  "source": {
    "taal": "teental",
    "form": "tihai",
    "jati": "chatusra",
    "cycles": 1,
    "composition_input": { "P": 16, "G": 8 }
  },
  "target": {
    "taal": "rupak",
    "jati": "chatusra"
  },
  "preserve_mode": "shape_ratio"
}
```

Notes:

- Source composition must already be valid for its source taal/jati/cycle context.
- v1 preserves structural math, not bols or gharana-specific phrasing.
- If `target.cycles` is omitted, the tool searches `1..12` cycles for the closest valid fit.

## 4) certification_catalog

Purpose: catalog certification tracks by board and level.

Input schema: `src/schemas/tool_input/certification_catalog.json`

## 5) assessment_builder

Purpose: build `practice_quiz` or `cert_mock` with answer key, brief rationales, and rubric.

Input schema: `src/schemas/tool_input/assessment_builder.json`

Notes:

- `mode` is required.
- `count` is optional (defaults to `10`).
- Each `answer_key` item includes a `rationale` object with:
  - `correct_reason`: why the correct option is correct.
  - `incorrect_reasons`: brief per-option reasons for why wrong options fail.

Example call:

```json
{
  "mode": "cert_mock",
  "board": "ABGMVM",
  "certification_level": "MADHYAMA_PRATHAM",
  "count": 20
}
```

## 6) practice_coach

Purpose: generate practical adaptive weekly plan from realistic availability.

Input schema: `src/schemas/tool_input/practice_coach.json`

## 7) taal_catalog

Purpose: full taal catalog or per-taal detail.

Input schema: `src/schemas/tool_input/taal_catalog.json`

## 8) composition_validator

Purpose: validate user-entered composition equation and timeline.

Input schema: `src/schemas/tool_input/composition_validator.json`

## 9) explain_taal (compatibility)

Purpose: compatibility alias for clients expecting `explain_taal`; uses canonical `taal_catalog` details.

Input schema: `src/schemas/tool_input/explain_taal.json`
