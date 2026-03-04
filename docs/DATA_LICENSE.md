# Data Licensing

## Repository datasets

Files in `data/samples/` and `data/curated/` are part of this repository and distributed under the repository's [MIT License](../LICENSE), unless noted otherwise.

### Website-derived curated metadata

- `data/curated/website_articles.json` is generated from public Tabla Focus API endpoints.
- It is metadata and indexing data curated by this project and maintained in-repo.
- Refresh command: `npm run content:sync`.

## External/imported datasets

Files imported via `scripts/sync_from_tablafocus.sh` are external content and are not re-licensed by this project.

- You are responsible for confirming you have redistribution and usage rights.
- Keep imported data in `data/private/raw` (gitignored content).
- Do not publish imported proprietary datasets in forks or release artifacts.

## Attribution and trademark notes

- Board and institution names are used descriptively for educational interoperability.
- Official websites are provided as references and do not imply endorsement.

## Compliance checklist before publishing

1. Confirm all committed data files are either repository-authored or explicitly licensed for redistribution.
2. Confirm no private app exports are committed.
3. Confirm references in `data/curated/certification_boards.json` are accurate and current.
