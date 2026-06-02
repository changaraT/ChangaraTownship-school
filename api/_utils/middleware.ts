/**
 * API Middleware Utilities for enhanced security and protection
 */

import type { NextApiResponse, NextApiRequest } from 'next';

// Rate limiting storage (in-memory, consider Redis for production)
interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

/**
 * Rate limiting middleware
 * Prevents abuse by limiting requests per IP/user
 */
export const withRateLimit = (
    maxRequests: number = 100,
    windowMs: number = 60000 // 1 minute
) => {
    return (handler: any) => async (req: NextApiRequest, res: NextApiResponse) => {
        const identifier = req.headers['x-forwarded-for'] as string || req.connection.remoteAddress || 'unknown';
        const key = `${identifier}:${req.url}`;

        const now = Date.now();
        let entry = rateLimitMap.get(key);

        if (!entry || now > entry.resetTime) {
            entry = { count: 1, resetTime: now + windowMs };
            rateLimitMap.set(key, entry);
        } else {
            entry.count++;
        }

        if (entry.count > maxRequests) {
            return res.status(429).json({ error: 'Too many requests. Please try again later.' });
        }

        return handler(req, res);
    };
};

/**
 * Input validation middleware
 * Ensures required fields are present and valid
 */
export const validateRequired = (fields: string[]) => {
    return (handler: any) => (req: NextApiRequest, res: NextApiResponse) => {
        const body = req.body || {};

        for (const field of fields) {
            if (!(field in body) || body[field] === null || body[field] === undefined || body[field] === '') {
                return res.status(400).json({ error: `Missing required field: ${field}` });
            }
        }

        return handler(req, res);
    };
};

/**
 * CORS middleware
 * Prevents cross-origin requests from untrusted sources
 */
export const withCORS = (allowedOrigins: string[] = ['http://localhost:3000']) => {
    return (handler: any) => (req: NextApiRequest, res: NextApiResponse) => {
        const origin = req.headers.origin as string;

        if (origin && allowedOrigins.includes(origin)) {
            res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
            res.setHeader('Access-Control-Allow-Credentials', 'true');
        }

        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }

        return handler(req, res);
    };
};

/**
 * Security headers middleware
 * Adds security headers to responses
 */
export const withSecurityHeaders = (handler: any) => (req: NextApiRequest, res: NextApiResponse) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(),microphone=(),camera=()');

    return handler(req, res);
};

/**
 * Error handler middleware
 * Standardizes error responses without leaking sensitive info
 */
export const withErrorHandler = (handler: any) => async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        return await handler(req, res);
    } catch (error: any) {
        console.error('API Error:', error);

        // Don't expose internal errors to client
        const statusCode = error.statusCode || 500;
        const message = statusCode === 500 ? 'Internal Server Error' : error.message;

        return res.status(statusCode).json({
            error: message,
            timestamp: new Date().toISOString(),
        });
    }
};

/**
 * Compose multiple middlewares
 * Usage: withMiddleware(withRateLimit(100, 60000), withSecurityHeaders, withErrorHandler)
 */
export const withMiddleware = (...middlewares: any[]) => {
    return (handler: any) => {
        return middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
    };
};

/**
 * Sanitize query parameters
 */
export const sanitizeQuery = (query: any): Record<string, string> => {
    const sanitized: Record<string, string> = {};

    for (const [key, value] of Object.entries(query)) {
        if (typeof value === 'string') {
            // Remove potentially dangerous characters
            sanitized[key] = value.replace(/[<>\"']/g, '').trim();
        } else if (Array.isArray(value)) {
            // Handle array query params (though we'll just take first value)
            sanitized[key] = String(value[0]).replace(/[<>\"']/g, '').trim();
        }
    }

    return sanitized;
};

/**
 * Validate HTTP method
 */
export const validateMethod = (allowedMethods: string[]) => {
    return (handler: any) => (req: NextApiRequest, res: NextApiResponse) => {
        if (!allowedMethods.includes(req.method || '')) {
            return res.status(405).json({ error: 'Method not allowed' });
        }
        return handler(req, res);
    };
};

/**
 * Clear old rate limit entries periodically
 */
export const cleanupRateLimitMap = () => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap.entries()) {
        if (now > entry.resetTime) {
            rateLimitMap.delete(key);
        }
    }
};

// Run cleanup every 5 minutes
setInterval(cleanupRateLimitMap, 5 * 60 * 1000);
