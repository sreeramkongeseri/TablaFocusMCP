# Cline MCP Setup

Add server to Cline MCP config:

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
