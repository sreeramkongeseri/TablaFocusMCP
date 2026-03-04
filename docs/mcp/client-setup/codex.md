# Codex CLI MCP Setup

Add the server:

```bash
codex mcp add tablafocus -- npx -y tablafocus-mcp@latest
```

Verify:

```bash
codex mcp list
```

Optional custom data source:

```bash
codex mcp add \
  --env TABLA_MCP_DATA_DIR=/ABSOLUTE/PATH/TO/DATA \
  --env TABLA_MCP_CURATED_DATA_DIR=/ABSOLUTE/PATH/TO/CURATED \
  tablafocus -- npx -y tablafocus-mcp@latest
```

Upgrade to the newest published release:

```bash
codex mcp remove tablafocus
codex mcp add tablafocus -- npx -y tablafocus-mcp@latest
```
