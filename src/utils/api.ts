/**
 * API Utilities for secure, efficient API calls with error handling
 */

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface ApiRequestOptions {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
    headers?: Record<string, string>;
    body?: any;
    credentials?: RequestCredentials;
    timeout?: number;
}

/**
 * Make secure API call with error handling
 */
export const apiCall = async <T = any>(
    endpoint: string,
    options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> => {
    const {
        method = 'GET',
        headers = {},
        body = null,
        credentials = 'include',
        timeout = 10000, // 10 second timeout
    } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(endpoint, {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
            credentials,
            body: body ? JSON.stringify(body) : null,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `API Error: ${response.status}`);
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        clearTimeout(timeoutId);
        const errorMessage =
            error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('API Error:', errorMessage);
        return { success: false, error: errorMessage };
    }
};

/**
 * Fetch paginated data with caching
 */
const fetchCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const fetchPaginatedData = async <T = any>(
    endpoint: string,
    page: number = 1,
    limit: number = 10,
    useCache: boolean = true
): Promise<ApiResponse<T[]>> => {
    const cacheKey = `${endpoint}?page=${page}&limit=${limit}`;

    // Check cache
    if (useCache && fetchCache.has(cacheKey)) {
        const cached = fetchCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            return { success: true, data: cached.data };
        }
    }

    const url = `${endpoint}?page=${page}&limit=${limit}`;
    const response = await apiCall<T[]>(url);

    if (response.success && response.data) {
        fetchCache.set(cacheKey, { data: response.data, timestamp: Date.now() });
    }

    return response;
};

/**
 * Clear fetch cache
 */
export const clearFetchCache = (pattern?: string) => {
    if (!pattern) {
        fetchCache.clear();
    } else {
        fetchCache.forEach((_, key) => {
            if (key.includes(pattern)) {
                fetchCache.delete(key);
            }
        });
    }
};

/**
 * Batch API calls (prevent N+1 queries)
 */
export const batchApiCall = async <T = any>(
    endpoints: string[],
    options: ApiRequestOptions = {}
): Promise<ApiResponse<T[]>> => {
    try {
        const responses = await Promise.all(
            endpoints.map((endpoint) => apiCall<T>(endpoint, options))
        );

        const allSuccessful = responses.every((r) => r.success);
        const data = responses
            .filter((r) => r.success && r.data)
            .map((r) => r.data);

        if (!allSuccessful && data.length === 0) {
            return {
                success: false,
                error: 'All batch requests failed',
            };
        }

        return {
            success: allSuccessful,
            data: data as T[],
            message: allSuccessful
                ? 'All requests successful'
                : `${responses.length - data.length} requests failed`,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Batch request failed',
        };
    }
};

/**
 * Retry API call with exponential backoff
 */
export const retryApiCall = async <T = any>(
    endpoint: string,
    options: ApiRequestOptions = {},
    maxRetries: number = 3,
    baseDelay: number = 1000
): Promise<ApiResponse<T>> => {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const response = await apiCall<T>(endpoint, options);
            if (response.success) {
                return response;
            }
            lastError = new Error(response.error);
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
        }

        if (attempt < maxRetries) {
            const delay = baseDelay * Math.pow(2, attempt);
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }

    return {
        success: false,
        error: lastError?.message || 'Max retries exceeded',
    };
};

/**
 * Handle common API errors
 */
export const handleApiError = (error: string): string => {
    const errorMap: Record<string, string> = {
        'Forbidden': 'You do not have permission to perform this action',
        'Unauthorized': 'Please log in to continue',
        'Not Found': 'The requested resource was not found',
        'Conflict': 'This record already exists',
        'Bad Request': 'Invalid data provided',
        'Server Error': 'An error occurred on the server. Please try again.',
    };

    for (const [key, message] of Object.entries(errorMap)) {
        if (error.includes(key)) {
            return message;
        }
    }

    return error || 'An unexpected error occurred';
};

/**
 * Debounce API calls
 */
let debounceTimer: NodeJS.Timeout;

export const debounceApiCall = <T = any>(
    endpoint: string,
    options: ApiRequestOptions = {},
    delay: number = 500
): Promise<ApiResponse<T>> => {
    return new Promise((resolve) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
            const response = await apiCall<T>(endpoint, options);
            resolve(response);
        }, delay);
    });
};
