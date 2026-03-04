# TablaFocusMCP

[![CI](https://github.com/sreeramkongeseri/TablaFocusMCP/actions/workflows/ci.yml/badge.svg)](https://github.com/sreeramkongeseri/TablaFocusMCP/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/sreeramkongeseri/TablaFocusMCP?sort=semver)](https://github.com/sreeramkongeseri/TablaFocusMCP/releases)
[![License](https://img.shields.io/github/license/sreeramkongeseri/TablaFocusMCP)](LICENSE)

TablaFocusMCP is a MCP server focused on tabla learning workflows.
It unifies glossary lookup, composition design and validation, certification preparation, practice planning, and taal explanation into one consistent interface for AI assistants and serious learners.
Alongside tools, it also exposes MCP resources (readable datasets) and prompts (guided workflows).

## Core Tools

| Tool                    | What it helps with                                         | What to provide                                                                                                                        |
| ----------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `glossary_lookup`       | Understand tabla terms quickly                             | `term` (word to look up), optional `category`, optional `limit` (max results, up to 100)                                               |
| `compose_builder`       | Build valid `tihai`, `tukra`, and `chakradhar` structures  | `taal`, `form`, `jati`; optional `cycles` (1-12)                                                                                       |
| `certification_catalog` | Find exam tracks by board and level                        | Optional `board`, optional `certification_level`                                                                                       |
| `assessment_builder`    | Generate practice quizzes or mock certification tests      | `mode` (`practice_quiz` or `cert_mock`), optional `count` (1-100, default 10); optional `board`, `certification_level`, `taal`, `seed` |
| `practice_coach`        | Create a weekly practice plan based on your goals and time | `goals`, `availability`; optional `profile_id`, optional `week_context` (missed days, completed minutes, fatigue)                      |
| `taal_catalog`          | Browse taals or fetch details for one taal                 | Optional `taal_id`                                                                                                                     |
| `composition_validator` | Check if a composition is structurally valid               | `taal`, `form`, `jati`, `cycles` (1-12), `composition_input`                                                                           |
| `explain_taal`          | Explain a taal (legacy/compatibility name)                 | `taal`                                                                                                                                 |

## MCP Resources

| Resource URI                            | What it provides                                    |
| --------------------------------------- | --------------------------------------------------- |
| `tabla://glossary`                      | Full glossary dataset plus category list            |
| `tabla://taals`                         | Full normalized taal catalog                        |
| `tabla://certification-boards`          | Curated certification board metadata and references |
| `tabla://certification-level-summaries` | Question-bank-derived level summaries               |

## MCP Prompts

| Prompt name             | What it guides                                         | Inputs                                                                                                                  |
| ----------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `cert_prep_plan`        | Certification workflow (`catalog` -> `mock` -> `plan`) | `board`, `certification_level`, `days_per_week`, `minutes_per_day`                                                      |
| `weekly_practice_reset` | Weekly reset workflow after missed sessions or fatigue | `goals` (semicolon-delimited), `daily_minutes`, `days_per_week`, optional `missed_days`, `completed_minutes`, `fatigue` |

## Install And Configure

Use directly from npm (no clone required):

```bash
npx -y tablafocus-mcp@latest
```

Check what `latest` currently resolves to:

```bash
npm view tablafocus-mcp version dist-tags --json
```

Pin to a specific version when needed:

```bash
npx -y tablafocus-mcp@0.1.2
```

### Codex CLI

```bash
codex mcp add tablafocus -- npx -y tablafocus-mcp@latest
```

### Claude Code

```bash
claude mcp add -s user tablafocus -- npx -y tablafocus-mcp@latest
```

### JSON-based clients (Claude Desktop, Cline, VS Code Copilot)

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

### Cursor

```json
{
  "name": "tablafocus",
  "command": "npx",
  "args": ["-y", "tablafocus-mcp@latest"]
}
```

Optional env vars:

- `TABLA_MCP_DATA_DIR` (default: package `data/samples`)
- `TABLA_MCP_CURATED_DATA_DIR` (default: package `data/curated`)
- `TABLA_MCP_RATE_LIMIT_PER_MINUTE` (default: `120`)
- `TABLA_MCP_DETERMINISTIC` (default: `true`)
- `TABLA_MCP_LOG_LEVEL` (default: `info`)

<p align="center">
  <img src="assets/tablafocus-mcp-icon.svg" alt="TablaFocusMCP icon" width="420" />
</p>

## Try These 3 Prompts

Copy and paste any of these in your MCP client:

1. Explain `teental` for a beginner.
2. Generate a valid 1-cycle `tihai` in `teental` (`chatusra`).
3. Create a weekly tabla practice plan for me (45 min/day, 5 days).

## Local Development

```bash
npm ci
npm run lint
npm test
npm run registry:check
npm run smoke:package
npm run dev
```

## Website Content Sync

Sync structured article metadata from `www.tablafocus.com` into curated JSON:

```bash
npm run content:sync
```

Freshness check (fails if local curated file is stale):

```bash
npm run content:check:freshness
```

Optional sync env var:

- `TABLA_MCP_SOURCE_BASE_URL` (default: `https://www.tablafocus.com`)

Build and run:

```bash
npm run build
npm start
```

## Documentation

- [Client setup guides](docs/mcp/client-setup/)
- [Tool list and examples](docs/mcp/tools.md)
- [Resource list and payloads](docs/mcp/resources.md)
- [Prompt list and usage](docs/mcp/prompts.md)
- [Input/output schemas](docs/mcp/schemas.md)
- [Error model](docs/mcp/error-model.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Data provenance](docs/DATA_PROVENANCE.md)
- [Data licensing](docs/DATA_LICENSE.md)
- [MCP registry submission](docs/mcp/registry-submission.md)
- [Changelog](CHANGELOG.md)

## Project Standards

- [MIT License](LICENSE)
- [Contributing guide](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Security policy](SECURITY.md)
- [Support](SUPPORT.md)
