"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTokens = generateTokens;
exports.verifyToken = verifyToken;
exports.decodeToken = decodeToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const constants_1 = require("@core/config/constants");
function generateTokens(userId) {
    const accessToken = jsonwebtoken_1.default.sign({
        userId,
        type: 'access',
        exp: Math.floor(Date.now() / 1000) + constants_1.ACCESS_TOKEN_EXPIRY
    }, constants_1.JWT_SECRET);
    const refreshToken = jsonwebtoken_1.default.sign({
        userId,
        type: 'refresh',
        exp: Math.floor(Date.now() / 1000) + constants_1.REFRESH_TOKEN_EXPIRY
    }, constants_1.JWT_SECRET);
    return { accessToken, refreshToken };
}
function verifyToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, constants_1.JWT_SECRET);
    }
    catch {
        return null;
    }
}
function decodeToken(token) {
    try {
        return jsonwebtoken_1.default.decode(token);
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=token.utils.js.map