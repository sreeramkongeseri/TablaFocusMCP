# Versioning and Backward Compatibility

Semantic versioning is used:

- `MAJOR`: breaking contract changes
- `MINOR`: backward-compatible feature additions
- `PATCH`: backward-compatible fixes

## Tool contract policy

1. Existing required fields will not be removed in minor/patch releases.
2. New optional fields may be added in minor releases.
3. Renames/removals require a major release and migration notes in `CHANGELOG.md`.
4. Aliases may be accepted for compatibility (example: `chakradar` -> `chakradhar`).
