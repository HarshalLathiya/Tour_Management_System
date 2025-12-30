// Success response utility
const success = (res, message, data = null, statusCode = 200) => {
    const response = {
        success: true,
        message
    };

    if (data !== null) {
        response.data = data;
    }

    return res.status(statusCode).json(response);
};

// Error response utility
const error = (res, message, statusCode = 500, errors = null) => {
    const response = {
        success: false,
        message
    };

    if (errors) {
        response.errors = errors;
    }

    return res.status(statusCode).json(response);
};

// Pagination response utility
const pagination = (res, message, data, paginationInfo, statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        pagination: paginationInfo
    });
};

// Created response utility
const created = (res, message, data = null) => {
    return success(res, message, data, 201);
};

// No content response utility
const noContent = (res, message = 'No content') => {
    return res.status(204).json({
        success: true,
        message
    });
};

// Bad request response utility
const badRequest = (res, message, errors = null) => {
    return error(res, message, 400, errors);
};

// Unauthorized response utility
const unauthorized = (res, message = 'Unauthorized') => {
    return error(res, message, 401);
};

// Forbidden response utility
const forbidden = (res, message = 'Forbidden') => {
    return error(res, message, 403);
};

// Not found response utility
const notFound = (res, message = 'Resource not found') => {
    return error(res, message, 404);
};

// Conflict response utility
const conflict = (res, message) => {
    return error(res, message, 409);
};

// Internal server error response utility
const internalServerError = (res, message = 'Internal server error') => {
    return error(res, message, 500);
};

module.exports = {
    success,
    error,
    pagination,
    created,
    noContent,
    badRequest,
    unauthorized,
    forbidden,
    notFound,
    conflict,
    internalServerError
};
