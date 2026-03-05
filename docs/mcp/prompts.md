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

## 3) `exam_week_plan`

Purpose: run a focused 7-day certification prep workflow for the final week before assessment.

Arguments:

- `board` (required)
- `certification_level` (required)
- `daily_minutes` (required)
- `weak_areas` (optional, semicolon-delimited string)
- `fatigue` (optional: `low` | `medium` | `high`)

Workflow intent:

1. Validate board/level context.
2. Call `certification_catalog`.
3. Call `assessment_builder` in `cert_mock` mode.
4. Call `practice_coach` with 7-day availability and fatigue context.
5. Return a day-by-day exam-week schedule with mock/revision/taper structure.

## 4) `missed_week_recovery`

Purpose: recover consistency after a disrupted week by adapting load and recalibrating skill level.

Arguments:

- `goals` (required, semicolon-delimited string)
- `daily_minutes` (required)
- `days_per_week` (required)
- `missed_days` (optional)
- `completed_minutes` (optional)
- `fatigue` (optional: `low` | `medium` | `high`)

Workflow intent:

1. Convert goals to an array and call `practice_coach`.
2. Call `assessment_builder` in `practice_quiz` mode.
3. Optionally call `compose_builder` + `composition_validator` for composition-focused goals.
4. Return a realistic restart plan with continuity checkpoints.

## 5) `composition_polish`

Purpose: iteratively draft and refine a composition until equation and timeline checks are clean.

Arguments:

- `taal` (required)
- `form` (required)
- `jati` (required: `tisra` | `chatusra` | `khanda` | `misra`)
- `cycles` (optional)
- `polish_rounds` (optional, 1-3)

Workflow intent:

1. Resolve taal context using `taal_catalog`.
2. Build a draft with `compose_builder`.
3. Validate structure with `composition_validator`.
4. Repeat refinement rounds.
5. Return a polished final composition plus concise revision notes.
