/**
 * PAGINATION UTILITY
 * Standardizes pagination across all list endpoints
 * Prevents N+1 queries and improves performance
 */

import { API_CONSTANTS } from '../config/constants.js';

/**
 * Parse and validate pagination parameters from request
 */
export const getPaginationParams = (req) => {
    let page = parseInt(req.query.page) || API_CONSTANTS.DEFAULT_PAGE;
    let limit = parseInt(req.query.limit) || API_CONSTANTS.DEFAULT_LIMIT;
    
    // Validate and constrain values
    page = Math.max(page, 1); // Minimum 1
    limit = Math.max(limit, API_CONSTANTS.MIN_LIMIT);
    limit = Math.min(limit, API_CONSTANTS.MAX_LIMIT); // Cap at MAX_LIMIT to prevent abuse
    
    const skip = (page - 1) * limit;
    
    return { page, limit, skip };
};

/**
 * Get pagination metadata (total count, pages, etc.)
 */
export const getPaginationMeta = (total, limit, page) => {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    return {
        total,
        limit,
        page,
        totalPages,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null,
    };
};

/**
 * Format paginated response
 */
export const formatPaginatedResponse = (data, total, limit, page) => {
    const meta = getPaginationMeta(total, limit, page);
    
    return {
        status: 'success',
        meta,
        data,
        timestamp: new Date().toISOString(),
    };
};

/**
 * Send paginated response
 */
export const sendPaginatedResponse = (res, data, total, limit, page, statusCode = 200) => {
    return res.status(statusCode).json(formatPaginatedResponse(data, total, limit, page));
};

/**
 * Parsing query for filtering
 * Allows: ?filter[field1]=value1&filter[field2]=value2
 */
export const parseFilterParams = (req) => {
    const filters = {};
    
    if (req.query.filter && typeof req.query.filter === 'object') {
        Object.assign(filters, req.query.filter);
    }
    
    return filters;
};

/**
 * Parsing sort parameters
 * Allows: ?sort=-createdAt,name (- for descending)
 */
export const parseSortParams = (req, allowedFields = []) => {
    const sortStr = req.query.sort;
    if (!sortStr) return {};
    
    const sort = {};
    
    sortStr.split(',').forEach(field => {
        const trimmed = field.trim();
        if (trimmed.startsWith('-')) {
            const fieldName = trimmed.slice(1);
            if (allowedFields.length === 0 || allowedFields.includes(fieldName)) {
                sort[fieldName] = -1;
            }
        } else if (allowedFields.length === 0 || allowedFields.includes(trimmed)) {
            sort[trimmed] = 1;
        }
    });
    
    return sort;
};

/**
 * Example usage in controller:
 * 
 * export const getAllUsers = async (req, res) => {
 *   try {
 *     const { page, limit, skip } = getPaginationParams(req);
 *     const total = await User.countDocuments();
 *     const users = await User.find()
 *       .skip(skip)
 *       .limit(limit)
 *       .sort({ createdAt: -1 });
 *     
 *     return sendPaginatedResponse(res, users, total, limit, page);
 *   } catch (err) {
 *     next(err);
 *   }
 * };
 */

export default {
    getPaginationParams,
    getPaginationMeta,
    formatPaginatedResponse,
    sendPaginatedResponse,
    parseFilterParams,
    parseSortParams,
};
