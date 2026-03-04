# Cline MCP Setup

Add server to Cline MCP config:

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

Optional custom data source:

```json
{
  "mcpServers": {
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
