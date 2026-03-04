import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AppContext } from '../context.js';

interface ResourceEnvelope<T> {
  version: string;
  generated_at: string;
  source: string;
  data: T;
}

function nowIsoDate(): string {
  return new Date().toISOString();
}

function createJsonContents<T>(uri: string, payload: ResourceEnvelope<T>) {
  return {
    contents: [
      {
        uri,
        mimeType: 'application/json',
        text: JSON.stringify(payload, null, 2),
      },
    ],
  };
}

export function registerResources(server: McpServer, context: AppContext): void {
  server.registerResource(
    'tabla-glossary',
    'tabla://glossary',
    {
      title: 'Tabla Glossary Dataset',
      description: 'Full glossary dataset plus category list.',
      mimeType: 'application/json',
    },
    async () => {
      const payload = {
        version: '1.0.0',
        generated_at: nowIsoDate(),
        source: 'configured dataDir/glossary.json',
        data: {
          total_entries: context.store.listGlossaryEntries().length,
          categories: context.store.listGlossaryCategories(),
          entries: context.store.listGlossaryEntries(),
        },
      };

      return createJsonContents('tabla://glossary', payload);
    },
  );

  server.registerResource(
    'tabla-taals',
    'tabla://taals',
    {
      title: 'Tabla Taal Catalog Dataset',
      description: 'Full normalized taal catalog used by taal and composition tools.',
      mimeType: 'application/json',
    },
    async () => {
      const payload = {
        version: '1.0.0',
        generated_at: nowIsoDate(),
        source: 'configured dataDir/talas.json',
        data: {
          total_taals: context.store.listTaals().length,
          taals: context.store.listTaals(),
        },
      };

      return createJsonContents('tabla://taals', payload);
    },
  );

  server.registerResource(
    'tabla-certification-boards',
    'tabla://certification-boards',
    {
      title: 'Tabla Certification Boards Dataset',
      description: 'Curated board metadata and reference links.',
      mimeType: 'application/json',
    },
    async () => {
      const payload = {
        version: '1.0.0',
        generated_at: nowIsoDate(),
        source: 'configured curatedDataDir/certification_boards.json',
        data: {
          total_boards: context.store.listCertificationBoards().length,
          boards: context.store.listCertificationBoards(),
        },
      };

      return createJsonContents('tabla://certification-boards', payload);
    },
  );

  server.registerResource(
    'tabla-certification-level-summaries',
    'tabla://certification-level-summaries',
    {
      title: 'Certification Level Summaries',
      description: 'Question-bank-derived level summaries across boards.',
      mimeType: 'application/json',
    },
    async () => {
      const summaries = context.store.getCertificationLevelSummaries({});
      const payload = {
        version: '1.0.0',
        generated_at: nowIsoDate(),
        source: 'configured dataDir/quiz_bank.json',
        data: {
          total_levels: summaries.length,
          summaries,
        },
      };

      return createJsonContents('tabla://certification-level-summaries', payload);
    },
  );
}
