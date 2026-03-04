# Cursor MCP Setup

In Cursor MCP settings, register:

```json
{
  "name": "tablafocus",
  "command": "npx",
  "args": ["-y", "tablafocus-mcp@latest"],
  "env": {
    "TABLA_MCP_DATA_DIR": "/ABSOLUTE/PATH/TO/DATA",
    "TABLA_MCP_CURATED_DATA_DIR": "/ABSOLUTE/PATH/TO/CURATED"
  }
}
```

If you do not need custom data paths, remove the `env` section.
