"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const morgan_1 = __importDefault(require("morgan"));
const logger_1 = __importDefault(require("./logger"));
const envConfig_1 = require("@core/config/envConfig");
morgan_1.default.token('message', (_req, res) => res.locals['errorMessage'] || '');
const getIpFormat = () => (envConfig_1.env.isProduction ? ':remote-addr - ' : '');
const successResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms`;
const errorResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms - message: :message`;
const successHandler = (0, morgan_1.default)(successResponseFormat, {
    skip: (_req, res) => res.statusCode >= 400,
    stream: { write: (message) => logger_1.default.info(message.trim()) },
});
const errorHandler = (0, morgan_1.default)(errorResponseFormat, {
    skip: (_req, res) => res.statusCode < 400,
    stream: { write: (message) => logger_1.default.error(message.trim()) },
});
exports.default = {
    successHandler,
    errorHandler,
};
