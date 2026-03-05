# Client Setup

Use one of the following client-specific setups to run TablaFocusMCP via npm:

```bash
npx -y tablafocus-mcp@latest
```

Optional environment variables for custom data:

- `TABLA_MCP_DATA_DIR=/ABSOLUTE/PATH/TO/DATA`
- `TABLA_MCP_CURATED_DATA_DIR=/ABSOLUTE/PATH/TO/CURATED`

## Codex CLI

```bash
codex mcp add tablafocus -- npx -y tablafocus-mcp@latest
codex mcp list
```

## Claude Code

```bash
claude mcp add -s user tablafocus -- npx -y tablafocus-mcp@latest
claude mcp list
```

## Claude Desktop

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

## Cline

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

## Cursor

```json
{
  "name": "tablafocus",
  "command": "npx",
  "args": ["-y", "tablafocus-mcp@latest"]
}
```

## VS Code Copilot

```json
{
  "mcp.servers": {
    "tablafocus": {
      "command": "npx",
      "args": ["-y", "tablafocus-mcp@latest"]
    }
  }
}
```

## Per-client Detail Pages

If you need copy/paste variants with env configuration and upgrade commands:

- `docs/mcp/client-setup/codex.md`
- `docs/mcp/client-setup/claude-code.md`
- `docs/mcp/client-setup/claude-desktop.md`
- `docs/mcp/client-setup/cline.md`
- `docs/mcp/client-setup/cursor.md`
- `docs/mcp/client-setup/vscode-copilot.md`
