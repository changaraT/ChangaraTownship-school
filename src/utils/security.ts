/**
 * Security Utilities for Input Sanitization, Validation, and Protection
 */

// Sanitize user input to prevent XSS attacks
export const sanitizeInput = (input: string): string => {
    if (!input) return '';
    return input
        .trim()
        .replace(/[<>\"']/g, (char) => {
            const entities: Record<string, string> = {
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#x27;',
            };
            return entities[char] || char;
        });
};

// Validate email format
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
};

// Validate phone number (Kenya format)
export const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\+254\d{9}$/;
    return phoneRegex.test(phone.trim());
};

// Validate admission number (alphanumeric only)
export const validateAdmissionNumber = (admNo: string): boolean => {
    const admRegex = /^[A-Z0-9\/-]+$/i;
    return admRegex.test(admNo.trim()) && admNo.length > 0 && admNo.length <= 50;
};

// Sanitize numeric input
export const sanitizeNumeric = (input: string): number => {
    const num = parseFloat(input);
    return Number.isNaN(num) || num < 0 ? 0 : num;
};

// Prevent SQL injection - validate input types
export const isValidInteger = (value: any): boolean => {
    const num = parseInt(value, 10);
    return !Number.isNaN(num) && Number.isInteger(num) && num > 0;
};

// Validate pagination parameters
export const validatePaginationParams = (
    page: number | string,
    limit: number | string,
    maxLimit: number = 100
): { page: number; limit: number } => {
    const pageNum = parseInt(String(page), 10);
    const limitNum = parseInt(String(limit), 10);

    return {
        page: Number.isNaN(pageNum) || pageNum < 1 ? 1 : pageNum,
        limit:
            Number.isNaN(limitNum) || limitNum < 1 || limitNum > maxLimit
                ? Math.min(10, maxLimit)
                : limitNum,
    };
};

// Validate class name
export const validateClassName = (className: string): boolean => {
    const validClasses = ['Foundation', 'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6', 'JSS 1', 'JSS 2', 'JSS 3'];
    return validClasses.includes(className.trim());
};

// Rate limiting helper (basic in-memory)
interface RateLimitStore {
    [key: string]: { count: number; timestamp: number };
}

const rateLimitStore: RateLimitStore = {};

export const checkRateLimit = (
    identifier: string,
    maxAttempts: number = 10,
    windowMs: number = 60000 // 1 minute
): boolean => {
    const now = Date.now();
    const userKey = `ratelimit_${identifier}`;

    if (!rateLimitStore[userKey]) {
        rateLimitStore[userKey] = { count: 1, timestamp: now };
        return true;
    }

    const record = rateLimitStore[userKey];

    // Reset if window expired
    if (now - record.timestamp > windowMs) {
        rateLimitStore[userKey] = { count: 1, timestamp: now };
        return true;
    }

    // Check if limit exceeded
    if (record.count >= maxAttempts) {
        return false;
    }

    record.count++;
    return true;
};

// Sanitize sorting field (prevent SQL injection in sort)
export const sanitizeSortField = (field: string, allowedFields: string[]): string => {
    const sanitized = field.trim().toLowerCase();
    return allowedFields.includes(sanitized) ? sanitized : allowedFields[0] || 'created_at';
};

// Sanitize sort direction
export const sanitizeSortDirection = (direction: string): 'asc' | 'desc' => {
    return direction.toLowerCase() === 'desc' ? 'desc' : 'asc';
};

// Validate form data structure
export const validateFormStructure = (
    data: any,
    expectedFields: string[]
): boolean => {
    if (!data || typeof data !== 'object') return false;
    return expectedFields.every((field) => field in data);
};

// Create safe query parameters
export const createSafeQueryParams = (
    params: Record<string, any>
): Record<string, string | number> => {
    const safe: Record<string, string | number> = {};

    for (const [key, value] of Object.entries(params)) {
        if (typeof value === 'string') {
            safe[key] = sanitizeInput(value);
        } else if (typeof value === 'number') {
            safe[key] = sanitizeNumeric(String(value));
        }
    }

    return safe;
};
