"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.errorConverter = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const logger_1 = require("../logger");
const _1 = require(".");
const envConfig_1 = require("@core/config/envConfig");
const errorConverter = (err, _req, _res, next) => {
    let error = err;
    if (!(error instanceof _1.ApiError)) {
        const statusCode = error.statusCode || http_status_codes_1.default.INTERNAL_SERVER_ERROR;
        const message = error.message || `${http_status_codes_1.default[statusCode]}`;
        const _stack = error.stack ? error.stack : err.stack;
        error = new _1.ApiError(statusCode, message, _stack, false);
    }
    next(error);
};
exports.errorConverter = errorConverter;
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
    let { statusCode, message } = err;
    if (envConfig_1.env.isProduction === true && !err.isOperational) {
        statusCode = http_status_codes_1.default.INTERNAL_SERVER_ERROR;
        message = 'Internal Server Error';
    }
    res.locals['errorMessage'] = err.message;
    let response = {
        code: statusCode,
        message,
        ...(envConfig_1.env.isProduction === false && { stack: err.stack }),
    };
    if (envConfig_1.env.isProduction === false) {
        logger_1.logger.error(err);
        res.status(statusCode).send({ error: response });
        return;
    }
    const encodeJsonObject = Buffer.from(JSON.stringify(response)).toString("base64");
    res.status(statusCode).send({ error: encodeJsonObject });
};
exports.errorHandler = errorHandler;
