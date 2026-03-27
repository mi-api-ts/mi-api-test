"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeToken = exports.catchAsync = exports.apiUtils = void 0;
class classDecodeToken {
}
const pick = (_bject, keys) => {
    return keys.reduce(function (obj, key) {
        if (_bject && Object.prototype.hasOwnProperty.call(_bject, key)) {
            if (isBase64(_bject[key])) {
                obj[key] = _bject[key];
            }
            else if (typeof _bject[key] === "string" && (_bject[key].includes("true") || _bject[key].includes("false"))) {
                obj[key] = JSON.parse(_bject[key]);
            }
            else {
                // eslint-disable-next-line no-param-reassign
                obj[key] = _bject[key];
            }
        }
        return obj;
    }, {});
};
class ApiError extends Error {
    constructor(statusCode, message, stack = '', isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        if (stack) {
            this.stack = stack;
        }
        else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
const base64RegExp = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{64})$/;
const isBase64 = (str) => base64RegExp.test(str);
exports.apiUtils = {
    pick,
    ApiError,
    isBase64
};
const catchAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};
exports.catchAsync = catchAsync;
exports.decodeToken = new classDecodeToken();
//# sourceMappingURL=utils.js.map