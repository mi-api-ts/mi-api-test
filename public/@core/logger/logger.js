"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const envConfig_1 = require("@core/config/envConfig");
const winston_1 = __importDefault(require("winston"));
const enumerateErrorFormat = winston_1.default.format((info) => {
    if (info instanceof Error) {
        Object.assign(info, { message: info.stack });
    }
    return info;
});
const logger = winston_1.default.createLogger({
    level: envConfig_1.env.isProduction === false ? 'debug' : 'info',
    format: winston_1.default.format.combine(enumerateErrorFormat(), envConfig_1.env.isProduction === false ? winston_1.default.format.colorize() : winston_1.default.format.uncolorize(), winston_1.default.format.splat(), winston_1.default.format.printf((info) => `${info.level}: ${info.message}`)),
    transports: [
        new winston_1.default.transports.Console({
            stderrLevels: ['error'],
        }),
    ],
});
exports.default = logger;
//# sourceMappingURL=logger.js.map