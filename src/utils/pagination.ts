/**
 * Pagination Utilities for efficient data listing
 */

export interface PaginationParams {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface PaginatedResult<T> {
    data: T[];
    pagination: PaginationParams;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

/**
 * Calculate pagination offset and limit
 */
export const calculatePagination = (
    page: number,
    limit: number,
    total: number
): { offset: number; limit: number; totalPages: number } => {
    const validPage = Math.max(1, page);
    const validLimit = Math.max(1, Math.min(limit, 100)); // Cap at 100 items per page
    const totalPages = Math.ceil(total / validLimit);
    const offset = (validPage - 1) * validLimit;

    return {
        offset,
        limit: validLimit,
        totalPages,
    };
};

/**
 * Paginate an array
 */
export const paginateArray = <T>(
    items: T[],
    page: number,
    limit: number
): PaginatedResult<T> => {
    const total = items.length;
    const { offset, limit: validLimit, totalPages } = calculatePagination(
        page,
        limit,
        total
    );

    const paginatedData = items.slice(offset, offset + validLimit);

    return {
        data: paginatedData,
        pagination: {
            page: Math.max(1, page),
            limit: validLimit,
            total,
            totalPages,
        },
        hasNextPage: offset + validLimit < total,
        hasPrevPage: page > 1,
    };
};

/**
 * Get pagination display info
 */
export const getPaginationInfo = (
    currentPage: number,
    limit: number,
    total: number
): { start: number; end: number; total: number; totalPages: number } => {
    const totalPages = Math.ceil(total / limit);
    const start = (currentPage - 1) * limit + 1;
    const end = Math.min(currentPage * limit, total);

    return {
        start: total === 0 ? 0 : start,
        end,
        total,
        totalPages,
    };
};

/**
 * Generate page numbers for pagination UI
 */
export const generatePageNumbers = (
    currentPage: number,
    totalPages: number,
    maxVisible: number = 7
): (number | string)[] => {
    if (totalPages <= maxVisible) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    const halfVisible = Math.floor(maxVisible / 2);
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) pages.push('...');
    }

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) pages.push('...');
        pages.push(totalPages);
    }

    return pages;
};

/**
 * React hook for managing pagination state
 * Usage: const { page, limit, goToPage, nextPage, prevPage } = usePagination();
 */
export const usePaginationHook = (initialPage: number = 1, initialLimit: number = 10) => {
    // This is for documentation - actual implementation uses useState in components
    return {
        page: initialPage,
        limit: initialLimit,
        goToPage: (page: number) => page,
        nextPage: () => initialPage + 1,
        prevPage: () => Math.max(1, initialPage - 1),
        resetPage: () => 1,
    };
};

/**
 * Format pagination info for display
 */
export const formatPaginationInfo = (
    page: number,
    limit: number,
    total: number
): string => {
    if (total === 0) return 'No results';
    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);
    return `Showing ${start}-${end} of ${total}`;
};
