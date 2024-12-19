import config from './config.js';
import basicAuth from 'express-basic-auth';

if (!config.http_auth.username || 
    !config.http_auth.password
) {
  throw new Error('Http auth configuration is missing.');
}

// Middleware for Basic HTTP Authentication
const authMiddleware = basicAuth({
    users: { [config.http_auth.username]: config.http_auth.password }, 
    challenge: true, 
    unauthorizedResponse: (req) => 'Authentication failed! Please check your credentials.', 
});

export default authMiddleware;