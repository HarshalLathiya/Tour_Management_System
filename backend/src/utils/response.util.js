const successResponse = (res, data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

const errorResponse = (res, message = 'Error', statusCode = 400, errors = null) => {
    const response = {
        success: false,
        message
    };

    if (errors) {
        response.errors = errors;
    }

    return res.status(statusCode).json(response);
};

const notFoundResponse = (res, message = 'Resource not found') => {
    return res.status(404).json({
        success: false,
        message
    });
};

const serverErrorResponse = (res, message = 'Internal server error') => {
    return res.status(500).json({
        success: false,
        message
    });
};

module.exports = {
    successResponse,
    errorResponse,
    notFoundResponse,
    serverErrorResponse
};