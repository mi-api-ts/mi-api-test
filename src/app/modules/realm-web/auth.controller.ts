import { Request, Response } from 'express';
import { createLoginResponse, createRefreshResponse, getUserByApiKey, getUserById } from "@core/services/auth.service";
import { LoginRequest, ProfileResponse } from "@core/types/auth.types";
import { Injectable } from "@om/inyects/injector";
import { AuthenticatedRequest } from '@core/auth.middleware';
import { ApiError } from '@core/errors';

@Injectable({ providedIn: "root" })
export class AuthController {



    login = async (_req: Request, _res: Response): Promise<void> => {
        console.log('\n🔐 [AUTH] ========== LOGIN REQUEST ==========');
        console.log(`📅 Timestamp: ${new Date().toISOString()}`);
        console.log(`📝 Method: ${_req.method}`);
        console.log(`📍 URL: ${_req.url}`);
        console.log(`📦 Body:`, JSON.stringify(_req.body, null, 2));
        console.log(`🌐 Headers:`, {
            'content-type': _req.headers['content-type'],
            'authorization': _req.headers['authorization'] ? 'present' : 'none'
        });

        const { key } = _req.body as LoginRequest;

        if (!key) {
            console.log('❌ [AUTH] Error: missing api key');
            _res.status(400).json({
                error: 'missing api key',
                error_code: 'BadRequest'
            });

            return
        }

        console.log(`🔑 [AUTH] API Key recibida: ${key.substring(0, 8)}...`);

        const user = getUserByApiKey(key);
        if (!user) {
            console.log('❌ [AUTH] Error: invalid api key');
            _res.status(401).json({
                error: 'invalid api key',
                error_code: 'InvalidAPIKey'
            });
            return
        }

        console.log(`✅ [AUTH] Usuario encontrado: ${user.userId}`);
        console.log(`👤 [AUTH] Profile:`, user.profile);

        const response = createLoginResponse(user.userId);

        console.log(`📤 [AUTH] Respuesta enviada:`);
        console.log(`   - user_id: ${response.user_id}`);
        console.log(`   - access_token: ${response.access_token.substring(0, 20)}...`);
        console.log(`   - refresh_token: ${response.refresh_token.substring(0, 20)}...`);
        console.log(`   - device_id: ${response.device_id}`);
        console.log('=============================================\n');

        _res.json(response);
    };


    // ============================================================================
    // REFRESH SESSION
    // ============================================================================

    refreshSession = (_req: AuthenticatedRequest, _res: Response) => {
        console.log('\n🔄 [AUTH] ========== REFRESH SESSION ==========');
        console.log(`📅 Timestamp: ${new Date().toISOString()}`);
        console.log(`📝 Method: ${_req.method}`);
        console.log(`📍 URL: ${_req.url}`);
        console.log(`👤 User ID: ${_req.realmUserId}`);

        const userId = _req.realmUserId!;
        const response = createRefreshResponse(userId);

        console.log(`📤 [AUTH] Nuevo access_token generado`);
        console.log('===============================================\n');

        _res.json(response);
    };

    // ============================================================================
    // LOGOUT
    // ============================================================================

    logout = (_req: AuthenticatedRequest, _res: Response) => {
        console.log('\n🚪 [AUTH] ========== LOGOUT ==========');
        console.log(`📅 Timestamp: ${new Date().toISOString()}`);
        console.log(`📝 Method: ${_req.method}`);
        console.log(`📍 URL: ${_req.url}`);
        console.log(`👤 User ID: ${_req.realmUserId}`);
        console.log('====================================\n');

        _res.status(200).send();
    };

    // ============================================================================
    // GET PROFILE - Ruta principal (con userId en URL)
    // ============================================================================

    getProfile = async (_req: AuthenticatedRequest, _res: Response): Promise<void> => {
        console.log('\n👤 [AUTH] ========== GET PROFILE (con userId) ==========');
        console.log(`📅 Timestamp: ${new Date().toISOString()}`);
        console.log(`📝 Method: ${_req.method}`);
        console.log(`📍 URL: ${_req.url}`);
        console.log(`🔍 Params:`, _req.params);
        console.log(`👤 Authenticated User ID: ${_req.realmUserId}`);

        const requestedUserId = _req.params.userId;
        const authenticatedUserId = _req.realmUserId;

        if (requestedUserId !== authenticatedUserId) {
            console.log(`❌ [AUTH] Forbidden: requested ${requestedUserId} but authenticated as ${authenticatedUserId}`);
            _res.status(403).json({ error: 'forbidden', error_code: 'Forbidden' });
            return
        }

        const user = getUserById(authenticatedUserId!);
        if (!user) {
            console.log(`❌ [AUTH] User not found: ${authenticatedUserId}`);
            _res.status(404).json({ error: 'user not found', error_code: 'UserNotFound' });
            return
        }

        console.log(`✅ [AUTH] Perfil encontrado para: ${user.userId}`);
        console.log(`📦 Profile data:`, user.profile);

        const response: ProfileResponse = {
            type: 'normal',
            identities: [
                {
                    id: user.userId,
                    provider_type: 'api-key'
                }
            ],
            data: user.profile
        };

        console.log(`📤 [AUTH] Respuesta enviada`);
        console.log('=========================================\n');

        _res.json(response);

    };

    // ============================================================================
    // GET PROFILE ALTERNATIVA - Ruta que realm-web usa después del login
    // GET /api/client/v2.0/auth/profile
    // ============================================================================

    getProfileAlternative = async (_req: AuthenticatedRequest, _res: Response): Promise<void> => {
        console.log(_req)
        console.log('\n👤 [AUTH] ========== GET PROFILE (ruta alternativa) ==========');
        console.log(`📅 Timestamp: ${new Date().toISOString()}`);
        console.log(`📝 Method: ${_req.method}`);
        console.log(`📍 URL: ${_req.url}`);
        console.log(`👤 Authenticated User ID: ${_req.realmUserId}`);

        const userId = _req.realmUserId;

        if (!userId) {
            console.log(`❌ [AUTH] No user ID in request`);
            _res.status(401).json({ error: 'unauthorized', error_code: 'Unauthorized' });
            return
        }

        const user = getUserById(userId);
        if (!user) {
            console.log(`❌ [AUTH] User not found: ${userId}`);
            _res.status(404).json({ error: 'user not found', error_code: 'UserNotFound' });
            return
        }

        console.log(`✅ [AUTH] Perfil encontrado para: ${user.userId}`);
        console.log(`📦 Profile data:`, user.profile);

        const response: ProfileResponse = {
            type: 'normal',
            identities: [
                {
                    id: user.userId,
                    provider_type: 'api-key'
                }
            ],
            data: user.profile
        };

        console.log(`📤 [AUTH] Respuesta enviada`);
        console.log('================================================\n');

        _res.json(response);

    };

    // ============================================================================
    // GET LOCATION
    // ============================================================================

    getLocation = async (_req: Request, _res: Response): Promise<void> => {
        
        console.log('\n📍 [AUTH] ========== GET LOCATION ==========');
        console.log(`📅 Timestamp: ${new Date().toISOString()}`);
        console.log(`📝 Method: ${_req.method}`);
        console.log(`📍 URL: ${_req.url}`);

        const protocol = _req.protocol;
        const host = _req.get('host');
        const hostname = `https://${host}`;

        console.log(`🏠 Hostname: ${hostname}`);
        console.log('========================================\n');

        _res.json({ hostname });

    };

}