# Claude Desktop Setup

Add to Claude Desktop MCP config:

```json
{
  "mcpServers": {
    "tablafocus": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TablaFocusMCP/dist/index.js"],
      "env": {
        "TABLA_MCP_DATA_DIR": "/ABSOLUTE/PATH/TablaFocusMCP/data/samples"
      }
    }
  }
}
```

Build first: `npm run build`.
