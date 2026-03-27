export const APP_ID = 'tu-abogado-iqgrkdm';
export const BASE_PATH = `/api/client/v2.0/app/${APP_ID}`;

export const REALM_API_KEY = process.env.REALM_API_KEY || 'your-api-key-from-environment';

export const ACCESS_TOKEN_EXPIRY = 3600;      // 1 hora en segundos
export const REFRESH_TOKEN_EXPIRY = 2592000;  // 30 días en segundos

export const DEFAULT_DEVICE_ID = '000000000000000000000000';
// src/@core/config/constants.ts

export const APP_NAME = 'Mi API Rest';
export const APP_VERSION = '1.0.0';

export const JWT_SECRET = process.env.JWT_SECRET || 'mi-secreto-default';
export const JWT_EXPIRES_IN = '7d';

export const DB_NAME = process.env.DB_NAME || 'mi_db';
export const DB_HOST = process.env.DB_HOST || 'localhost';
export const DB_PORT = parseInt(process.env.DB_PORT || '27017');

export const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
};

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;