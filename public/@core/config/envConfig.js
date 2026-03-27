"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
require("dotenv/config");
const joi_1 = __importDefault(require("joi"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let isProduction = process.env.NODE_ENV === 'production';
const envVarsSchema = joi_1.default.object()
    .keys({
    NODE_ENV: joi_1.default.string().valid('production', 'development', 'test'),
    HOST: joi_1.default.string().default('localhost'),
    PORT: joi_1.default.number().default(5000),
    CORS_ORIGIN: joi_1.default.string().default('http://localhost:5000'),
    COMMON_RATE_LIMIT_MAX_REQUESTS: joi_1.default.number().default(1000),
    COMMON_RATE_LIMIT_WINDOW_MS: joi_1.default.number().default(1000),
    JWT_SECRET: joi_1.default.string().default('omacho').required(),
})
    .unknown();
const { value: envVars, error } = envVarsSchema
    .prefs({ errors: { label: 'key' } })
    .validate(process.env);
if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}
exports.env = {
    isProduction,
    AWS_ACCESS_APP_ID: envVars.AWS_ACCESS_APP_ID,
    NODE_ENV: envVars.NODE_ENV,
    HOST: envVars.HOST,
    PORT: envVars.PORT,
    JWT_SECRET: envVars.JWT_SECRET,
    JWT_ACCESS_EXPIRATION_MINUTES: joi_1.default.number()
        .default(30)
        .description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: joi_1.default.number()
        .default(30)
        .description('days after which refresh tokens expire'),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: joi_1.default.number()
        .default(10)
        .description('minutes after which reset password token expires'),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: joi_1.default.number()
        .default(10)
        .description('minutes after which verify email token expires'),
    CORS_ORIGIN: envVars.CORS_ORIGIN,
    COMMON_RATE_LIMIT_MAX_REQUESTS: envVars.COMMON_RATE_LIMIT_MAX_REQUESTS,
    COMMON_RATE_LIMIT_WINDOW_MS: envVars.COMMON_RATE_LIMIT_WINDOW_MS,
    jwt: {
        secret: envVars.JWT_SECRET,
        accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
        refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
        resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
        verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
        cookieOptions: {
            httpOnly: true,
            secure: envVars.NODE_ENV === 'production',
            signed: true,
        },
    },
    servers: [
        {
            host: 'http://localhost:5000',
            hostName: 'localhost:5000',
            database: 'abogadoExcel',
            appId: 'tu-abogado-iqgrkdm',
            apiKey: 'JcRZz3QAqxCNkCtTXuEonqFAXdg39tawnmBtljk5qgJNPz0tBtGHCUL44z1r146y',
            ws: 'http://localhost:5000',
        },
    ],
    email: {
        smtp: {
            host: envVars.SMTP_HOST,
            port: envVars.SMTP_PORT,
            auth: {
                user: envVars.SMTP_USERNAME,
                pass: envVars.SMTP_PASSWORD,
            },
        },
        from: envVars.EMAIL_FROM,
    },
    clientUrl: envVars.CLIENT_URL,
};
//# sourceMappingURL=envConfig.js.map