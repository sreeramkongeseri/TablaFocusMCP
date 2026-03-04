# Claude Code MCP Setup

Add the server at user scope:

```bash
claude mcp add -s user tablafocus -- npx -y tablafocus-mcp@latest
```

Verify:

```bash
claude mcp list
```

Optional custom data source:

```bash
claude mcp add -s user \
  -e TABLA_MCP_DATA_DIR=/ABSOLUTE/PATH/TO/DATA \
  -e TABLA_MCP_CURATED_DATA_DIR=/ABSOLUTE/PATH/TO/CURATED \
  tablafocus -- npx -y tablafocus-mcp@latest
```

Upgrade to the newest published release:

```bash
claude mcp remove tablafocus
claude mcp add -s user tablafocus -- npx -y tablafocus-mcp@latest
```
