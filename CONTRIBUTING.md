# Contributing

## Setup

1. `npm ci`
2. `cp .env.example .env`
3. `npm run build`
4. `npm test`
5. `npm run smoke:package`
6. `npm run registry:check`

## Development loop

1. Run `npm run dev`.
2. Add tests under `tests/unit` or `tests/integration`.
3. Run `npm run lint && npm test && npm run build && npm run smoke:package && npm run registry:check` before opening a PR.
4. Do not commit private imported datasets under `data/private/raw`.

## PR expectations

1. Keep tool contract changes backward compatible unless major version bump.
2. Update `CHANGELOG.md` for user-visible changes.
3. Add/adjust example workflows in `examples/` when behavior changes.
4. Include tests for any tool logic change.
