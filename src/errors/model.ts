export type ErrorCode =
  | 'INVALID_INPUT'
  | 'NOT_FOUND'
  | 'VALIDATION_FAILED'
  | 'COVERAGE_GAP'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR';

export class ToolError extends Error {
  code: ErrorCode;
  details?: Record<string, unknown>;

  constructor(code: ErrorCode, message: string, details?: Record<string, unknown>) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

export function toToolErrorPayload(error: unknown): {
  code: ErrorCode;
  message: string;
  details?: Record<string, unknown>;
} {
  if (error instanceof ToolError) {
    return {
      code: error.code,
      message: error.message,
      details: error.details,
    };
  }

  if (error instanceof Error) {
    const isDebug = process.env.NODE_ENV === 'development';
    return {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
      details: isDebug ? { reason: error.message } : undefined,
    };
  }

  return {
    code: 'INTERNAL_ERROR',
    message: 'Unknown internal error',
  };
}
