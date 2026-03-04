# Cline MCP Setup

Add server to Cline MCP config:

```json
{
  "mcpServers": {
    "tablafocus": {
      "command": "npx",
      "args": ["-y", "tablafocus-mcp@0.1.0"]
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
      "args": ["-y", "tablafocus-mcp@0.1.0"],
      "env": {
        "TABLA_MCP_DATA_DIR": "/ABSOLUTE/PATH/TO/DATA",
        "TABLA_MCP_CURATED_DATA_DIR": "/ABSOLUTE/PATH/TO/CURATED"
      }
    }
  }
}
```
