"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_LIMIT = exports.DEFAULT_PAGE = exports.HTTP_STATUS = exports.CORS_ORIGIN = exports.DB_PORT = exports.DB_HOST = exports.DB_NAME = exports.JWT_EXPIRES_IN = exports.JWT_SECRET = exports.APP_VERSION = exports.APP_NAME = exports.DEFAULT_DEVICE_ID = exports.REFRESH_TOKEN_EXPIRY = exports.ACCESS_TOKEN_EXPIRY = exports.REALM_API_KEY = exports.BASE_PATH = exports.APP_ID = void 0;
exports.APP_ID = 'tu-abogado-iqgrkdm';
exports.BASE_PATH = `/api/client/v2.0/app/${exports.APP_ID}`;
exports.REALM_API_KEY = process.env.REALM_API_KEY || 'your-api-key-from-environment';
exports.ACCESS_TOKEN_EXPIRY = 3600; // 1 hora en segundos
exports.REFRESH_TOKEN_EXPIRY = 2592000; // 30 días en segundos
exports.DEFAULT_DEVICE_ID = '000000000000000000000000';
// src/@core/config/constants.ts
exports.APP_NAME = 'Mi API Rest';
exports.APP_VERSION = '1.0.0';
exports.JWT_SECRET = process.env.JWT_SECRET || 'mi-secreto-default';
exports.JWT_EXPIRES_IN = '7d';
exports.DB_NAME = process.env.DB_NAME || 'mi_db';
exports.DB_HOST = process.env.DB_HOST || 'localhost';
exports.DB_PORT = parseInt(process.env.DB_PORT || '27017');
exports.CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
exports.HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
};
exports.DEFAULT_PAGE = 1;
exports.DEFAULT_LIMIT = 10;
