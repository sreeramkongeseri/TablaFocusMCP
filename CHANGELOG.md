# Changelog

All notable changes to this project are documented here.

## [Unreleased]

## [0.1.2] - 2026-03-04

### Added

- `explain_taal` compatibility tool alias.
- MCP resources:
  - `tabla://glossary`
  - `tabla://taals`
  - `tabla://certification-boards`
  - `tabla://certification-level-summaries`
- MCP prompts:
  - `cert_prep_plan`
  - `weekly_practice_reset`
- GitHub release automation workflow (`.github/workflows/release.yml`).
- Public repo trust/ops files: `SUPPORT.md`, `NOTICE`, `docs/ARCHITECTURE.md`,
  `docs/DATA_PROVENANCE.md`, `docs/DATA_LICENSE.md`, `.github/CODEOWNERS`,
  `.github/dependabot.yml`.
- Open sample datasets under `data/samples`.

### Changed

- Default dataset path changed from `data/raw` to `data/samples`.
- Public/private data split introduced (`data/samples` + `data/private/raw`).
- npm package publishing scope tightened using `package.json#files`.
- Internal error responses now redact raw exception text unless in development mode.

### Removed

- Removed committed `data/raw/*.json` payloads from repository default path.
- Removed `.github/project-roadmap.md` seed file.

## [0.1.0] - 2026-03-04

### Added

- Initial MCP server with 7 tools:
  - `glossary_lookup`
  - `compose_builder`
  - `certification_catalog`
  - `assessment_builder`
  - `practice_coach`
  - `taal_catalog`
  - `composition_validator`
- Deterministic composition rule engine for tihai/tukra/chakradhar.
- Data adapters using Tabla Focus JSON datasets (`glossary`, `talas`, `quiz_bank`).
- MCP docs, examples, test suite, lint/build pipeline, and CI workflow.
