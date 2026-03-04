#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { loadConfig } from './config.js';
import { AppContext } from './context.js';
import { ContentStore } from './data/contentStore.js';
import { RateLimiter } from './rateLimiter.js';
import { buildServer } from './server.js';

async function main(): Promise<void> {
  const config = loadConfig();

  const store = new ContentStore(config);
  await store.load();

  const context: AppContext = {
    store,
    limiter: new RateLimiter(config.rateLimitPerMinute),
  };

  const server = buildServer(context);

  await server.connect(new StdioServerTransport());
}

main().catch((error) => {
  const message = error instanceof Error ? (error.stack ?? error.message) : String(error);
  process.stderr.write(`[TablaFocusMCP] Fatal startup error: ${message}\n`);
  process.exit(1);
});
