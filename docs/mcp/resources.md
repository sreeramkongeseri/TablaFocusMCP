# MCP Resource List

Resources provide read-only datasets that clients can discover and load directly.

## Resource envelope

Each resource returns JSON with:

- `version`: payload format version
- `generated_at`: ISO timestamp of generation
- `source`: dataset origin
- `data`: dataset-specific payload

## 1) `tabla://glossary`

Purpose: expose full glossary dataset with categories.

Payload:

- `data.total_entries`
- `data.categories`
- `data.entries`

## 2) `tabla://taals`

Purpose: expose full normalized taal catalog.

Payload:

- `data.total_taals`
- `data.taals`

## 3) `tabla://certification-boards`

Purpose: expose curated board metadata and references.

Payload:

- `data.total_boards`
- `data.boards`

## 4) `tabla://certification-level-summaries`

Purpose: expose question-bank-derived board/level summaries.

Payload:

- `data.total_levels`
- `data.summaries`
