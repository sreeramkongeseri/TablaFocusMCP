import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AppContext } from './context.js';
import { registerPrompts } from './prompts/registerPrompts.js';
import { registerResources } from './resources/registerResources.js';
import { registerAssessmentBuilderTool } from './tools/assessmentBuilder.js';
import { registerCertificationCatalogTool } from './tools/certificationCatalog.js';
import { registerComposeBuilderTool } from './tools/composeBuilder.js';
import { registerCompositionTransposerTool } from './tools/compositionTransposer.js';
import { registerCompositionValidatorTool } from './tools/compositionValidator.js';
import { registerExplainTaalTool } from './tools/explainTaal.js';
import { registerGlossaryLookupTool } from './tools/glossaryLookup.js';
import { registerPracticeCoachTool } from './tools/practiceCoach.js';
import { registerTaalCatalogTool } from './tools/taalCatalog.js';

function resolveServerVersion(): string {
  const envVersion = process.env.npm_package_version?.trim();
  if (envVersion) {
    return envVersion;
  }

  try {
    const moduleDir = path.dirname(fileURLToPath(import.meta.url));
    const packageJsonPath = path.resolve(moduleDir, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as {
      version?: string;
    };

    if (packageJson.version && packageJson.version.trim().length > 0) {
      return packageJson.version.trim();
    }
  } catch {
    // fallback below
  }

  return '0.1.0';
}

const SERVER_VERSION = resolveServerVersion();

export function buildServer(context: AppContext): McpServer {
  const server = new McpServer({
    name: 'TablaFocusMCP',
    version: SERVER_VERSION,
  });

  registerResources(server, context);
  registerPrompts(server);

  registerGlossaryLookupTool(server, context);
  registerComposeBuilderTool(server, context);
  registerCompositionTransposerTool(server, context);
  registerCertificationCatalogTool(server, context);
  registerAssessmentBuilderTool(server, context);
  registerPracticeCoachTool(server, context);
  registerTaalCatalogTool(server, context);
  registerExplainTaalTool(server, context);
  registerCompositionValidatorTool(server, context);

  return server;
}
