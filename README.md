# TablaFocusMCP

![TablaFocusMCP icon](assets/tablafocus-mcp-icon.svg)

Universal Model Context Protocol server for structured tabla learning, composition math, certification-style assessment generation, and practical practice planning.

## What It Does

Turns curated tabla knowledge plus deterministic composition logic into MCP tools any compliant client can call.

## 60-Second Quickstart

```bash
cd /path/to/TablaFocusMCP
npm ci
cp .env.example .env
npm run dev
```

## Why This Exists

Most tabla learning software is either static reference material or unstructured chat output. TablaFocusMCP is designed to provide consistent, inspectable, tool-contract outputs for real learning workflows.

### Target users

- Tabla students (beginner to advanced)
- Tabla teachers and curriculum designers
- AI assistant builders needing reliable tabla pedagogy tools

## Supported MCP Clients

- Codex CLI: [setup guide](docs/mcp/client-setup/codex.md)
- Claude Code: [setup guide](docs/mcp/client-setup/claude-code.md)
- Claude Desktop: [setup guide](docs/mcp/client-setup/claude-desktop.md)
- VS Code (Copilot MCP): [setup guide](docs/mcp/client-setup/vscode-copilot.md)
- Cursor: [setup guide](docs/mcp/client-setup/cursor.md)
- Cline: [setup guide](docs/mcp/client-setup/cline.md)

## Install and Run

### Install for MCP clients (recommended)

Run without cloning this repo:

```bash
npx -y tablafocus-mcp@latest
```

Pin to a specific version for reproducibility:

```bash
npx -y tablafocus-mcp@0.1.0
```

Then configure your MCP client using the setup guides above.

### Local development

```bash
npm ci
npm run lint
npm test
npm run dev
```

pnpm equivalent:

```bash
pnpm install
pnpm lint
pnpm test
pnpm dev
```

### Build and run

```bash
npm run build
npm start
```

### Production (Docker)

```bash
docker build -t tablafocus-mcp .
docker run --rm -i tablafocus-mcp
```

### Production (Package install path)

```bash
npm install -g tablafocus-mcp@0.1.0
tablafocus-mcp
```

## Environment Variables

All variables are documented in [.env.example](.env.example).

- `TABLA_MCP_DATA_DIR` (default `./data/samples`)
- `TABLA_MCP_CURATED_DATA_DIR` (default `./data/curated`)
- `TABLA_MCP_RATE_LIMIT_PER_MINUTE` (default `120`)
- `TABLA_MCP_DETERMINISTIC` (default `true`)
- `TABLA_MCP_LOG_LEVEL` (default `info`)

## Tools

1. `glossary_lookup(term?, category?)`
2. `compose_builder(taal, form, jati, cycles?)`
3. `certification_catalog(board?, certification_level?)`
4. `assessment_builder(mode, board?, certification_level?, taal?, count)`
5. `practice_coach(profile_id?, goals, availability, week_context?)`
6. `taal_catalog(taal_id?)`
7. `composition_validator(taal, form, jati, cycles, composition_input)`
8. `explain_taal(taal)` compatibility alias mapped to `taal_catalog`

Tool contracts and docs:

- [Tool list and examples](docs/mcp/tools.md)
- [Input/output schemas](docs/mcp/schemas.md)
- [Error model](docs/mcp/error-model.md)
- [Rate limits](docs/mcp/rate-limits.md)
- [Versioning policy](docs/mcp/versioning-policy.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Data provenance](docs/DATA_PROVENANCE.md)
- [Data licensing](docs/DATA_LICENSE.md)
- [MCP official docs](https://modelcontextprotocol.io/docs/learn/architecture)

## Data Strategy

- `data/samples/`: open, redistributable sample datasets used by default.
- `data/private/raw/`: optional local import target for private app exports (gitignored content).

Import private app data into local storage:

```bash
./scripts/sync_from_tablafocus.sh /path/to/TablaFocusData
```

Or via environment variable:

```bash
TABLAFOCUS_APP_DATA_DIR=/path/to/TablaFocusData ./scripts/sync_from_tablafocus.sh
```

Then run with:

```bash
TABLA_MCP_DATA_DIR=./data/private/raw npm run dev
```

## Reproducible Demo

```bash
./scripts/demo.sh
```

## Engineering Quality Signals

- Unit + integration tests in `tests/`
- CI workflow in `.github/workflows/ci.yml`
- Release workflow in `.github/workflows/release.yml`
- Lint + formatter + pre-commit hooks
- Semantic changelog in `CHANGELOG.md`

## Open Source Trust Pack

- [MIT License](LICENSE)
- [Contributing guide](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Security policy](SECURITY.md)
- [Support](SUPPORT.md)

## Known Limitations

- Certification metadata is a normalized teaching taxonomy and not a complete legal/official syllabus mirror for every board.
- `practice_coach` is deterministic and practical but does not yet persist long-term user telemetry server-side.
- Composition builder standardizes on `chakradhar` spelling and accepts `chakradar` alias.

## Roadmap and Maintenance

- Planned items tracked in [ROADMAP.md](ROADMAP.md)
- Issue and PR templates are included under `.github/`
- Current release cadence starts at `v0.1.0` with target monthly minor releases
