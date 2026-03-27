import express, { type Router } from 'express';
import { BASE_PATH } from '@core/config/constants';
import { authenticateAccessToken, authenticateRefreshToken } from '@core/auth.middleware';
import { inject } from '@om/inyects/provider.registry';
import { AuthController } from 'app/modules/realm-web/auth.controller';
import { catchAsync } from '@core/utils';



const router: Router = express.Router();
// ============================================================================
// RUTAS DE AUTENTICACIÓN
// ============================================================================
const _authController = inject(AuthController)
// 1. Login con API Key
router.post(`${BASE_PATH}/auth/providers/api-key/login`, catchAsync(_authController.login));

// 2. Refresh token (solo acepta refresh token)
router.post(`${BASE_PATH}/auth/session`, catchAsync(authenticateRefreshToken), catchAsync(_authController.refreshSession));

// 3. Logout (solo acepta refresh token)
router.delete(`${BASE_PATH}/auth/session`, catchAsync(authenticateRefreshToken), catchAsync(_authController.logout));

// 4. Obtener perfil - Ruta principal (con userId en URL)
router.get(`${BASE_PATH}/users/:userId/profile`, catchAsync(authenticateAccessToken), catchAsync(_authController.getProfile));

// 5. Obtener perfil - Ruta alternativa que realm-web usa después del login
//    Esta ruta es la que realm-web intenta primero
router.get('/api/client/v2.0/auth/profile', catchAsync(authenticateAccessToken), catchAsync(_authController.getProfileAlternative));

// 6. Obtener ubicación del app
router.get(`${BASE_PATH}/location`, catchAsync(_authController.getLocation));

export default router;
