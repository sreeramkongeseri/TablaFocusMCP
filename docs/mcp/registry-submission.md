# MCP Registry Submission

This project is prepared for GitHub MCP Registry publication via `server.json` at repository root.

## Registry assets in this repo

- `server.json`: MCP metadata in the official schema format.
- `package.json#mcpName`: canonical MCP identifier (`io.github.sreeramkongeseri/tablafocus-mcp`).
- `npm run registry:check`: validates metadata consistency between `package.json` and `server.json`.

## Pre-submission checklist

1. Confirm package is published on npm with the target version.
2. Ensure `package.json` `version` matches `server.json` top-level `version`.
3. Ensure `server.json` npm package entry version matches package version.
4. Run:

```bash
npm run registry:check
```

## Submit to GitHub MCP Registry

Install the official publisher CLI (macOS/Homebrew):

```bash
brew install mcp-publisher
```

Authenticate for local publishing:

```bash
mcp-publisher login github
```

Publish using repository `server.json`:

```bash
mcp-publisher publish
```

For CI publishing from GitHub Actions, use GitHub OIDC:

```bash
mcp-publisher login github-oidc
```

For other auth routes and installation options (Linux/Windows binaries), use the upstream docs:

- [MCP Publisher quickstart](https://modelcontextprotocol.io/docs/develop/publish)
- [GitHub Actions publishing guide](https://modelcontextprotocol.io/docs/develop/publishing/github-actions)

## Post-submission verification

1. Confirm listing appears at `https://github.com/mcp`.
2. Confirm server detail route resolves for this `name`:

```text
io.github.sreeramkongeseri/tablafocus-mcp
```

3. Confirm install instructions still launch the published npm package:

```bash
npx -y tablafocus-mcp@latest
```
