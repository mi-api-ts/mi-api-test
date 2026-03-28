"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("@core/services/auth.service");
const injector_1 = require("@om/inyects/injector");
let AuthController = class AuthController {
    constructor() {
        this.login = async (_req, _res) => {
            console.log('\n🔐 [AUTH] ========== LOGIN REQUEST ==========');
            console.log(`📅 Timestamp: ${new Date().toISOString()}`);
            console.log(`📝 Method: ${_req.method}`);
            console.log(`📍 URL: ${_req.url}`);
            console.log(`📦 Body:`, JSON.stringify(_req.body, null, 2));
            console.log(`🌐 Headers:`, {
                'content-type': _req.headers['content-type'],
                'authorization': _req.headers['authorization'] ? 'present' : 'none'
            });
            const { key } = _req.body;
            if (!key) {
                console.log('❌ [AUTH] Error: missing api key');
                _res.status(400).json({
                    error: 'missing api key',
                    error_code: 'BadRequest'
                });
                return;
            }
            console.log(`🔑 [AUTH] API Key recibida: ${key.substring(0, 8)}...`);
            const user = (0, auth_service_1.getUserByApiKey)(key);
            if (!user) {
                console.log('❌ [AUTH] Error: invalid api key');
                _res.status(401).json({
                    error: 'invalid api key',
                    error_code: 'InvalidAPIKey'
                });
                return;
            }
            console.log(`✅ [AUTH] Usuario encontrado: ${user.userId}`);
            console.log(`👤 [AUTH] Profile:`, user.profile);
            const response = (0, auth_service_1.createLoginResponse)(user.userId);
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
        this.refreshSession = (_req, _res) => {
            console.log('\n🔄 [AUTH] ========== REFRESH SESSION ==========');
            console.log(`📅 Timestamp: ${new Date().toISOString()}`);
            console.log(`📝 Method: ${_req.method}`);
            console.log(`📍 URL: ${_req.url}`);
            console.log(`👤 User ID: ${_req.realmUserId}`);
            const userId = _req.realmUserId;
            const response = (0, auth_service_1.createRefreshResponse)(userId);
            console.log(`📤 [AUTH] Nuevo access_token generado`);
            console.log('===============================================\n');
            _res.json(response);
        };
        // ============================================================================
        // LOGOUT
        // ============================================================================
        this.logout = (_req, _res) => {
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
        this.getProfile = async (_req, _res) => {
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
                return;
            }
            const user = (0, auth_service_1.getUserById)(authenticatedUserId);
            if (!user) {
                console.log(`❌ [AUTH] User not found: ${authenticatedUserId}`);
                _res.status(404).json({ error: 'user not found', error_code: 'UserNotFound' });
                return;
            }
            console.log(`✅ [AUTH] Perfil encontrado para: ${user.userId}`);
            console.log(`📦 Profile data:`, user.profile);
            const response = {
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
        this.getProfileAlternative = async (_req, _res) => {
            console.log(_req);
            console.log('\n👤 [AUTH] ========== GET PROFILE (ruta alternativa) ==========');
            console.log(`📅 Timestamp: ${new Date().toISOString()}`);
            console.log(`📝 Method: ${_req.method}`);
            console.log(`📍 URL: ${_req.url}`);
            console.log(`👤 Authenticated User ID: ${_req.realmUserId}`);
            const userId = _req.realmUserId;
            if (!userId) {
                console.log(`❌ [AUTH] No user ID in request`);
                _res.status(401).json({ error: 'unauthorized', error_code: 'Unauthorized' });
                return;
            }
            const user = (0, auth_service_1.getUserById)(userId);
            if (!user) {
                console.log(`❌ [AUTH] User not found: ${userId}`);
                _res.status(404).json({ error: 'user not found', error_code: 'UserNotFound' });
                return;
            }
            console.log(`✅ [AUTH] Perfil encontrado para: ${user.userId}`);
            console.log(`📦 Profile data:`, user.profile);
            const response = {
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
        this.getLocation = async (_req, _res) => {
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
};
exports.AuthController = AuthController;
exports.AuthController = AuthController = __decorate([
    (0, injector_1.Injectable)({ providedIn: "root" })
], AuthController);
//# sourceMappingURL=auth.controller.js.map