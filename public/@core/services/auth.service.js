"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserByApiKey = getUserByApiKey;
exports.createUserFromApiKey = createUserFromApiKey;
exports.getUserById = getUserById;
exports.userExists = userExists;
exports.createLoginResponse = createLoginResponse;
exports.createRefreshResponse = createRefreshResponse;
const mongodb_1 = require("mongodb");
const token_utils_1 = require("../utils/token.utils");
const constants_1 = require("../config/constants");
// Almacenamiento en memoria (en producción usar MongoDB)
const usersDb = new Map();
// Usuario por defecto
const defaultUser = {
    userId: new mongodb_1.ObjectId().toHexString(),
    apiKey: constants_1.REALM_API_KEY,
    profile: {
        email: 'simulado@ejemplo.com',
        name: 'Usuario Simulado',
        picture: 'https://ejemplo.com/avatar.png'
    },
    createdAt: new Date()
};
usersDb.set(defaultUser.userId, defaultUser);
function getUserByApiKey(apiKey) {
    console.log("apiKey", apiKey, usersDb.values());
    for (const user of usersDb.values()) {
        if (user.apiKey === apiKey) {
            return user;
        }
    }
    return undefined;
}
function createUserFromApiKey(apiKey) {
    const userId = new mongodb_1.ObjectId().toHexString();
    const newUser = {
        userId,
        apiKey,
        profile: {
            email: `user_${userId.substring(0, 8)}@simulado.local`,
            name: `Usuario ${userId.substring(0, 8)}`
        },
        createdAt: new Date()
    };
    usersDb.set(userId, newUser);
    return newUser;
}
function getUserById(userId) {
    return usersDb.get(userId);
}
function userExists(userId) {
    return usersDb.has(userId);
}
function createLoginResponse(userId) {
    const { accessToken, refreshToken } = (0, token_utils_1.generateTokens)(userId);
    return {
        user_id: userId,
        access_token: accessToken,
        refresh_token: refreshToken,
        device_id: '000000000000000000000000'
    };
}
function createRefreshResponse(userId) {
    const { accessToken } = (0, token_utils_1.generateTokens)(userId);
    return { access_token: accessToken };
}
//# sourceMappingURL=auth.service.js.map