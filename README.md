# TablaFocusMCP

[![CI](https://github.com/sreeramkongeseri/TablaFocusMCP/actions/workflows/ci.yml/badge.svg)](https://github.com/sreeramkongeseri/TablaFocusMCP/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/sreeramkongeseri/TablaFocusMCP?sort=semver)](https://github.com/sreeramkongeseri/TablaFocusMCP/releases)
[![License](https://img.shields.io/github/license/sreeramkongeseri/TablaFocusMCP)](LICENSE)

TablaFocusMCP is a MCP server focused on tabla learning workflows.
It unifies glossary lookup, composition design and validation, certification preparation, practice planning, and taal explanation into one consistent interface for AI assistants and serious learners.
Alongside tools, it also exposes MCP resources (readable datasets) and prompts (guided workflows).

<p align="center">
  <img src="assets/tablafocus-mcp-icon.png" alt="TablaFocusMCP icon" width="420" />
</p>

## How To Use

Once `tablafocus` is installed in your MCP client, chat naturally about what you want to practice or build.
The assistant can explain taals, generate compositions, create quizzes/mocks, and plan practice weeks.

Try prompts like these:

1. `Explain teental for a beginner, including vibhag structure, sam, and khali.`
2. `Generate a valid 1-cycle tihai in teental (chatusra) and show the beat-by-beat mapping.`
3. `Create a weekly tabla practice plan for 45 minutes/day, 5 days/week, focused on clarity and layakari.`
4. `Build a 15-question ABGMVM Madhyama Pratham mock test with answer key and short rationales.`
5. `I have a tihai idea for teental. Help me refine it so it resolves cleanly to sam in 1 cycle.`

Workflow prompt templates are also available:

| Prompt name             | What it guides                                         | Inputs                                                                                                                  |
| ----------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `cert_prep_plan`        | Certification workflow (`catalog` -> `mock` -> `plan`) | `board`, `certification_level`, `days_per_week`, `minutes_per_day`                                                      |
| `weekly_practice_reset` | Weekly reset workflow after missed sessions or fatigue | `goals` (semicolon-delimited), `daily_minutes`, `days_per_week`, optional `missed_days`, `completed_minutes`, `fatigue` |
| `exam_week_plan`        | Focused 7-day exam prep workflow                       | `board`, `certification_level`, `daily_minutes`, optional `weak_areas`, `fatigue`                                      |
| `missed_week_recovery`  | Recovery workflow after a disrupted practice week      | `goals` (semicolon-delimited), `daily_minutes`, `days_per_week`, optional `missed_days`, `completed_minutes`, `fatigue` |
| `composition_polish`    | Iterative composition draft -> validate -> refine flow | `taal`, `form`, `jati`, optional `cycles`, optional `polish_rounds`                                                     |

## Core Tools

All tools return a common envelope with `meta` and `data`.

| Tool | What it does | Required inputs | Optional inputs | Output highlights |
| --- | --- | --- | --- | --- |
| `glossary_lookup` | Finds glossary terms and definitions | None | `term`, `category`, `limit` (1-100) | Matching entries, categories list, total matches |
| `compose_builder` | Builds mathematically valid compositions | `taal`, `form`, `jati` (`tisra`\|`chatusra`\|`khanda`\|`misra`) | `cycles` (1-12) | Composition equation, parameters, timeline segments, alternatives |
| `certification_catalog` | Lists certification tracks and level breakdowns | None | `board`, `certification_level` | Board/level catalog with papers, categories, objectives, references |
| `assessment_builder` | Creates quizzes and certification mocks | `mode` (`practice_quiz`\|`cert_mock`) | `count` (1-100, default 10), `seed`, `board`, `certification_level`, `taal` | Questions, answer key with rationale, rubric, optional certification reference |
| `practice_coach` | Generates adaptive weekly practice plans | `goals` (array), `availability` (object) | `profile_id`, `availability.daily_minutes` (1-600), `availability.weekly_minutes` (1-4000), `availability.days_per_week` (1-7), `week_context.missed_days` (0-7), `week_context.completed_minutes` (0-4000), `week_context.fatigue` (`low`\|`medium`\|`high`) | Weekly target, daily targets, per-day sessions, adaptive adjustments |
| `taal_catalog` | Returns full catalog or one taal detail | None | `taal_id` | Taal structure, vibhag, sam/khali, clap-wave, counting guidance, theka |
| `composition_validator` | Validates composition equation and timeline checks | `taal`, `form`, `jati`, `cycles` (1-12), `composition_input` | `composition_input.P`, `G`, `M`, `g`, optional detailed `segments` | `is_valid`, failure reasons, equation/timeline/segment checks |
| `explain_taal` | Compatibility alias for taal explanation | `taal` | None | Explanation payload sourced from canonical `taal_catalog` data |

## How To Install

Run directly from npm:

```bash
npx -y tablafocus-mcp@latest
```

Codex CLI:

```bash
codex mcp add tablafocus -- npx -y tablafocus-mcp@latest
```

Claude Code:

```bash
claude mcp add -s user tablafocus -- npx -y tablafocus-mcp@latest
```

JSON-based clients (Claude Desktop, Cline, VS Code Copilot):

```json
{
  "mcpServers": {
    "tablafocus": {
      "command": "npx",
      "args": ["-y", "tablafocus-mcp@latest"]
    }
  }
}
```

Cursor:

```json
{
  "name": "tablafocus",
  "command": "npx",
  "args": ["-y", "tablafocus-mcp@latest"]
}
```

## Documentation

- [Client setup](docs/mcp/client-setup.md)
- [MCP reference](docs/mcp/reference.md)
- [Changelog](CHANGELOG.md)
- [Contributing guide](CONTRIBUTING.md)
- [MIT License](LICENSE)
