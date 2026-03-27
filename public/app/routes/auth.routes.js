"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const constants_1 = require("@core/config/constants");
const auth_middleware_1 = require("@core/auth.middleware");
const provider_registry_1 = require("@om/inyects/provider.registry");
const auth_controller_1 = require("app/modules/realm-web/auth.controller");
const utils_1 = require("@core/utils");
const router = express_1.default.Router();
// ============================================================================
// RUTAS DE AUTENTICACIÓN
// ============================================================================
const _authController = (0, provider_registry_1.inject)(auth_controller_1.AuthController);
// 1. Login con API Key
router.post(`${constants_1.BASE_PATH}/auth/providers/api-key/login`, (0, utils_1.catchAsync)(_authController.login));
// 2. Refresh token (solo acepta refresh token)
router.post(`${constants_1.BASE_PATH}/auth/session`, (0, utils_1.catchAsync)(auth_middleware_1.authenticateRefreshToken), (0, utils_1.catchAsync)(_authController.refreshSession));
// 3. Logout (solo acepta refresh token)
router.delete(`${constants_1.BASE_PATH}/auth/session`, (0, utils_1.catchAsync)(auth_middleware_1.authenticateRefreshToken), (0, utils_1.catchAsync)(_authController.logout));
// 4. Obtener perfil - Ruta principal (con userId en URL)
router.get(`${constants_1.BASE_PATH}/users/:userId/profile`, (0, utils_1.catchAsync)(auth_middleware_1.authenticateAccessToken), (0, utils_1.catchAsync)(_authController.getProfile));
// 5. Obtener perfil - Ruta alternativa que realm-web usa después del login
//    Esta ruta es la que realm-web intenta primero
router.get('/api/client/v2.0/auth/profile', (0, utils_1.catchAsync)(auth_middleware_1.authenticateAccessToken), (0, utils_1.catchAsync)(_authController.getProfileAlternative));
// 6. Obtener ubicación del app
router.get(`${constants_1.BASE_PATH}/location`, (0, utils_1.catchAsync)(_authController.getLocation));
exports.default = router;
//# sourceMappingURL=auth.routes.js.map