import { ContentStore } from './data/contentStore.js';
import { RateLimiter } from './rateLimiter.js';

export interface AppContext {
  store: ContentStore;
  limiter: RateLimiter;
}
