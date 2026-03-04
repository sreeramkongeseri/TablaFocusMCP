import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

export interface AppConfig {
  dataDir: string;
  curatedDataDir: string;
  rateLimitPerMinute: number;
  deterministic: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

function parseBoolean(input: string | undefined, defaultValue: boolean): boolean {
  if (input == null) {
    return defaultValue;
  }
  const normalized = input.trim().toLowerCase();
  return ['1', 'true', 'yes', 'on'].includes(normalized);
}

function parseNumber(input: string | undefined, defaultValue: number): number {
  const parsed = Number(input);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : defaultValue;
}

export function loadConfig(): AppConfig {
  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  const packageRoot = path.resolve(moduleDir, '..');

  const dataDir = process.env.TABLA_MCP_DATA_DIR
    ? path.resolve(process.env.TABLA_MCP_DATA_DIR)
    : path.resolve(packageRoot, 'data', 'samples');

  const curatedDataDir = process.env.TABLA_MCP_CURATED_DATA_DIR
    ? path.resolve(process.env.TABLA_MCP_CURATED_DATA_DIR)
    : path.resolve(packageRoot, 'data', 'curated');

  const logLevel = (process.env.TABLA_MCP_LOG_LEVEL ?? 'info') as AppConfig['logLevel'];

  return {
    dataDir,
    curatedDataDir,
    rateLimitPerMinute: parseNumber(process.env.TABLA_MCP_RATE_LIMIT_PER_MINUTE, 120),
    deterministic: parseBoolean(process.env.TABLA_MCP_DETERMINISTIC, true),
    logLevel,
  };
}
