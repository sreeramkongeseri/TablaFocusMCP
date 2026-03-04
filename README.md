# TablaFocusMCP

[![CI](https://github.com/sreeramkongeseri/TablaFocusMCP/actions/workflows/ci.yml/badge.svg)](https://github.com/sreeramkongeseri/TablaFocusMCP/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/sreeramkongeseri/TablaFocusMCP?sort=semver)](https://github.com/sreeramkongeseri/TablaFocusMCP/releases)
[![License](https://img.shields.io/github/license/sreeramkongeseri/TablaFocusMCP)](LICENSE)

TablaFocusMCP is a production-ready MCP server focused on tabla learning workflows.
It unifies glossary lookup, composition design and validation, certification preparation, practice planning, and taal explanation into one consistent interface for AI assistants and serious learners.

## Install And Configure

Use directly from npm (no clone required):

```bash
npx -y tablafocus-mcp@latest
```

Pin to a specific version when needed:

```bash
npx -y tablafocus-mcp@0.1.0
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

## Core Tools

| Tool                    | What it helps with                                         | Inputs                                                                                                            |
| ----------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `glossary_lookup`       | Understand tabla terms quickly                             | `term`, optional `category`, optional `limit` (up to 100)                                                         |
| `compose_builder`       | Build valid `tihai`, `tukra`, and `chakradhar` structures  | `taal`, `form`, `jati`, optional `cycles` (1-12)                                                                  |
| `certification_catalog` | Find exam tracks by board and level                        | Optional `board`, optional `certification_level`                                                                  |
| `assessment_builder`    | Generate practice quizzes or certification mocks           | `mode` (`practice_quiz` or `cert_mock`), `count` (1-100), optional `board`, `certification_level`, `taal`, `seed` |
| `practice_coach`        | Create a weekly practice plan from your goals and time     | `goals`, `availability`, optional `profile_id`, optional `week_context`                                           |
| `taal_catalog`          | Browse all taals or fetch details for a specific taal      | Optional `taal_id`                                                                                                |
| `composition_validator` | Validate composition structure against taal and form rules | `taal`, `form`, `jati`, `cycles` (1-12), `composition_input`                                                      |
| `explain_taal`          | Explain a taal (compatibility alias)                       | `taal`                                                                                                            |

## Local Development

```bash
npm ci
npm run lint
npm test
npm run dev
```

Build and run:

```bash
npm run build
npm start
```

## Documentation

- [Client setup guides](docs/mcp/client-setup/)
- [Tool list and examples](docs/mcp/tools.md)
- [Input/output schemas](docs/mcp/schemas.md)
- [Error model](docs/mcp/error-model.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Data provenance](docs/DATA_PROVENANCE.md)
- [Data licensing](docs/DATA_LICENSE.md)
- [Changelog](CHANGELOG.md)

## Project Standards

- [MIT License](LICENSE)
- [Contributing guide](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Security policy](SECURITY.md)
- [Support](SUPPORT.md)
