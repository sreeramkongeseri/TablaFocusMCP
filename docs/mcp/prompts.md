# MCP Prompt List

Prompts provide reusable workflow templates that guide the assistant through consistent multi-step flows.

## 1) `cert_prep_plan`

Purpose: run a certification-preparation workflow in one guided template.

Arguments:

- `board` (required)
- `certification_level` (required)
- `days_per_week` (required)
- `minutes_per_day` (required)

Workflow intent:

1. Read board context from `tabla://certification-boards`.
2. Call `certification_catalog`.
3. Call `assessment_builder` in `cert_mock` mode.
4. Call `practice_coach`.
5. Produce a structured weekly prep plan.

## 2) `weekly_practice_reset`

Purpose: rebuild a practical week plan after misses/fatigue.

Arguments:

- `goals` (required, semicolon-delimited string)
- `daily_minutes` (required)
- `days_per_week` (required)
- `missed_days` (optional)
- `completed_minutes` (optional)
- `fatigue` (optional: `low` | `medium` | `high`)

Workflow intent:

1. Convert `goals` to an array.
2. Call `practice_coach` with availability + week context.
3. Optionally call `compose_builder` for composition-focused goals.
4. Return a concise weekly schedule with checkpoints.
