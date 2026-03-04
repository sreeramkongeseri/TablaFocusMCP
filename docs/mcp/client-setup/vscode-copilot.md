# VS Code Copilot MCP Setup

Use the MCP server config in VS Code settings:

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

Optional custom data source:

```json
{
  "mcp.servers": {
    "tablafocus": {
      "command": "npx",
      "args": ["-y", "tablafocus-mcp@latest"],
      "env": {
        "TABLA_MCP_DATA_DIR": "/ABSOLUTE/PATH/TO/DATA",
        "TABLA_MCP_CURATED_DATA_DIR": "/ABSOLUTE/PATH/TO/CURATED"
      }
    }
  }
}
```
