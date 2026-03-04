import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ToolError, toToolErrorPayload } from './errors/model.js';
import { RateLimiter } from './rateLimiter.js';

export interface ToolMeta {
  tool: string;
  coverage_status: 'full' | 'partial' | 'conflicted' | 'sparse' | 'unavailable';
  confidence: number;
  confidence_reason: string;
  last_verified_at: string;
  source: string;
}

export function successResult<T>(meta: ToolMeta, data: T): CallToolResult {
  const payload = { meta, data };
  return {
    content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
    structuredContent: payload,
  };
}

export function errorResult(error: unknown): CallToolResult {
  const payload = toToolErrorPayload(error);
  return {
    isError: true,
    content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
    structuredContent: payload,
  };
}

export async function guarded(
  limiter: RateLimiter,
  toolName: string,
  action: () => Promise<CallToolResult> | CallToolResult,
): Promise<CallToolResult> {
  try {
    limiter.assertAllowed(toolName);
    return await action();
  } catch (error) {
    if (error instanceof ToolError) {
      return errorResult(error);
    }
    return errorResult(error);
  }
}

export function nowIsoDate(): string {
  return new Date().toISOString();
}
