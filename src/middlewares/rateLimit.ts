// import { Plugin, Request, ResponseToolkit, Server } from '@hapi/hapi';
// import rateLimit from 'hapi-rate-limit';

// // Type definition for rate limit options
// interface RateLimitOptions {
//   enabled: boolean;
//   userLimit: number;
//   userCache: {
//     expiresIn: number;
//   };
//   pathLimit: boolean;
//   headers: boolean;
//   getUserKey: (request: Request) => string;
//   onError: (request: Request, h: ResponseToolkit, error: Error) => any;
// }

// const rateLimitPlugin: Plugin<RateLimitOptions> = {
//   name: 'rateLimit',
//   register: async (server: Server) => {
//     await server.register({
//       plugin: rateLimit,
//       options: {
//         enabled: true,
//         userLimit: 5, // 5 requests per minute per user
//         userCache: {
//           expiresIn: 60 * 1000 // 1 minute window
//         },
//         pathLimit: false, // Disable path-based limiting
//         headers: true, // Show X-RateLimit-* headers
//         trustProxy: true, // For reverse proxy setups
        
//         // Get user ID from JWT credentials
//         getUserKey: (request: Request) => {
//           const credentials = request.auth.credentials as { userId: string };
//           return credentials.userId;
//         },

//         // Custom error handler
//         onError: (request: Request, h: ResponseToolkit) => {
//           return h.response({
//             statusCode: 429,
//             error: 'Too Many Requests',
//             message: 'Message limit exceeded: 5 messages per minute'
//           }).code(429);
//         },

//         // (Optional) Add paths to ignore
//         pathFilter: (request: Request) => {
//           // Exclude documentation routes from rate limiting
//           return !request.path.startsWith('/documentation');
//         }
//       } as RateLimitOptions
//     });

//     // Apply rate limiting to specific routes
//     server.route({
//       method: 'POST',
//       path: '/messages',
//       handler: () => {}, // Actual handler in messages controller
//       options: {
//         plugins: {
//           'hapi-rate-limit': {
//             enabled: true
//           }
//         }
//       }
//     });
//   }
// };

// export default rateLimitPlugin;