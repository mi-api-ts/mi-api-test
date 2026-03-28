"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    console.error('Error:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    });
    const statusCode = err.statusCode || 500;
    const errorCode = err.errorCode || 'InternalServerError';
    const message = err.message || 'Internal server error';
    res.status(statusCode).json({
        error: message,
        error_code: errorCode
    });
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res) => {
    res.status(404).json({
        error: 'Not found',
        error_code: 'ResourceNotFound',
        path: req.path
    });
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=error.middleware.js.map