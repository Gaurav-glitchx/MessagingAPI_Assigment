import { Plugin, Request, ResponseToolkit, Server } from '@hapi/hapi';

const RATE_LIMIT = {
  MAX_REQUESTS: 5,
  WINDOW_MS: 60 * 1000
};

const requestStore = new Map<string, { count: number, resetTime: number }>();

export const rateLimitPlugin: Plugin<void> = {
  name: 'rateLimit',
  version: '1.0.0',
  register: async (server: Server) => {
    // Cleanup interval
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      requestStore.forEach((value, key) => {
        if (value.resetTime < now) requestStore.delete(key);
      });
    }, RATE_LIMIT.WINDOW_MS);

    server.events.on('stop', () => clearInterval(cleanupInterval));

    // Rate limiting logic
    server.ext('onPreHandler', (request, h) => {  // Changed from onPreAuth to onPreHandler
      // Only apply to POST /messages
      if (request.path !== '/messages' || request.method.toLowerCase() !== 'post') {
        return h.continue;
      }

      // Get identifier (using IP address for simplicity)
      const identifier = request.info.remoteAddress;

      // Get or create rate limit entry
      const now = Date.now();
      let entry = requestStore.get(identifier);
      
      if (!entry || entry.resetTime < now) {
        entry = { count: 0, resetTime: now + RATE_LIMIT.WINDOW_MS };
        requestStore.set(identifier, entry);
      }

      // Check limit
      if (entry.count >= RATE_LIMIT.MAX_REQUESTS) {
        return h.response({
          statusCode: 429,
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Try again in ${Math.ceil((entry.resetTime - now)/1000)} seconds`
        }).code(429).takeover();  // Added .takeover()
      }

      // Increment count
      entry.count++;
      
      return h.continue;
    });
  }
};