import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AppContext } from './context.js';
import { registerAssessmentBuilderTool } from './tools/assessmentBuilder.js';
import { registerCertificationCatalogTool } from './tools/certificationCatalog.js';
import { registerComposeBuilderTool } from './tools/composeBuilder.js';
import { registerCompositionValidatorTool } from './tools/compositionValidator.js';
import { registerExplainTaalTool } from './tools/explainTaal.js';
import { registerGlossaryLookupTool } from './tools/glossaryLookup.js';
import { registerPracticeCoachTool } from './tools/practiceCoach.js';
import { registerTaalCatalogTool } from './tools/taalCatalog.js';

export function buildServer(context: AppContext): McpServer {
  const server = new McpServer({
    name: 'TablaFocusMCP',
    version: '0.1.0',
  });

  registerGlossaryLookupTool(server, context);
  registerComposeBuilderTool(server, context);
  registerCertificationCatalogTool(server, context);
  registerAssessmentBuilderTool(server, context);
  registerPracticeCoachTool(server, context);
  registerTaalCatalogTool(server, context);
  registerExplainTaalTool(server, context);
  registerCompositionValidatorTool(server, context);

  return server;
}
