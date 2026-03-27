"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateRefreshToken = exports.authenticateAccessToken = void 0;
const token_utils_1 = require("./utils/token.utils");
const auth_service_1 = require("./services/auth.service");
const errors_1 = require("./errors");
const authenticateAccessToken = (_req, _res, _next) => {
    const authHeader = _req.headers.authorization;
    console.log(authHeader);
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new errors_1.ApiError(401, 'unauthorized');
    }
    const token = authHeader.split(' ')[1];
    const payload = (0, token_utils_1.verifyToken)(token);
    if (!payload) {
        throw new errors_1.ApiError(401, 'invalid token', 'InvalidSession');
    }
    if (payload.type !== 'access') {
        throw new errors_1.ApiError(401, 'invalid token type - access required');
    }
    if (!(0, auth_service_1.userExists)(payload.userId)) {
        throw new errors_1.ApiError(401, 'invalid session', 'InvalidSession');
    }
    _req.realmUserId = payload.userId;
    _next();
    return;
};
exports.authenticateAccessToken = authenticateAccessToken;
const authenticateRefreshToken = (_req, _res, _next) => {
    const authHeader = _req.headers.authorization;
    console.log("_req", _req);
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new errors_1.ApiError(401, 'unauthorized');
    }
    const token = authHeader.split(' ')[1];
    const payload = (0, token_utils_1.verifyToken)(token);
    if (!payload) {
        throw new errors_1.ApiError(401, 'invalid refresh token');
    }
    if (payload.type !== 'refresh') {
        throw new errors_1.ApiError(401, 'nvalid token type - refresh required');
    }
    if (!(0, auth_service_1.userExists)(payload.userId)) {
        throw new errors_1.ApiError(401, 'nvalid session', "InvalidSession");
    }
    _req.realmUserId = payload.userId;
    _next();
    return;
};
exports.authenticateRefreshToken = authenticateRefreshToken;
