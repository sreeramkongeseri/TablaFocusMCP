# VS Code Copilot MCP Setup

Use the MCP server config in VS Code settings:

```json
{
  "mcp.servers": {
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
