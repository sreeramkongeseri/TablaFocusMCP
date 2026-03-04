# TablaFocusMCP

[![CI](https://github.com/sreeramkongeseri/TablaFocusMCP/actions/workflows/ci.yml/badge.svg)](https://github.com/sreeramkongeseri/TablaFocusMCP/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/sreeramkongeseri/TablaFocusMCP?sort=semver)](https://github.com/sreeramkongeseri/TablaFocusMCP/releases)
[![License](https://img.shields.io/github/license/sreeramkongeseri/TablaFocusMCP)](LICENSE)

Tabla-focused MCP server for glossary lookup, composition math, certification prep, practice planning, and taal validation.

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

### GitHub Packages (optional)

Package name on GitHub Packages:

```text
@sreeramkongeseri/tablafocus-mcp
```

Authenticate npm with a GitHub classic PAT (`read:packages`):

```bash
echo "@sreeramkongeseri:registry=https://npm.pkg.github.com" >> ~/.npmrc
echo "//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN" >> ~/.npmrc
```

Then run:

```bash
npx -y @sreeramkongeseri/tablafocus-mcp@latest
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

## Included Tools

- `glossary_lookup`
- `compose_builder`
- `certification_catalog`
- `assessment_builder`
- `practice_coach`
- `taal_catalog`
- `composition_validator`
- `explain_taal` (compatibility alias)

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
