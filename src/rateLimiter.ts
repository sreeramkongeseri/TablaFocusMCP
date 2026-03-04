import { ToolError } from './errors/model.js';

export class RateLimiter {
  private readonly buckets = new Map<string, { count: number; windowStartMs: number }>();

  constructor(private readonly limitPerMinute: number) {}

  assertAllowed(key: string): void {
    const now = Date.now();
    const minuteMs = 60_000;
    const current = this.buckets.get(key);

    if (!current || now - current.windowStartMs >= minuteMs) {
      this.buckets.set(key, { count: 1, windowStartMs: now });
      return;
    }

    if (current.count >= this.limitPerMinute) {
      throw new ToolError('RATE_LIMITED', `Rate limit exceeded for ${key}`, {
        limit_per_minute: this.limitPerMinute,
      });
    }

    current.count += 1;
  }
}
