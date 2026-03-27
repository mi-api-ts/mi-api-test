"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const utils_1 = require("@core/utils");
const db_core_1 = require("@db/db.core");
const injector_1 = require("@om/inyects/injector");
const provider_registry_1 = require("@om/inyects/provider.registry");
const db_utils_1 = __importDefault(require("@db/db.utils"));
const db_mongo_1 = require("@db/db.mongo");
const errors_1 = require("@core/errors");
const todoFunctions = {};
let MongoController = class MongoController {
    constructor() {
        // ============================================================================
        // HANDLER PARA OPERACIONES DE COLECCIÓN (find, insertOne, etc.)
        // ============================================================================
        this.mongoOperationHandler = async (req, res) => {
            const dbCore = (0, provider_registry_1.inject)(db_core_1.DbCore);
            const params = utils_1.apiUtils.pick(req.params, [
                'id',
                'type',
                'option',
                'credetial',
                'path',
            ]);
            const _callFunctions = utils_1.apiUtils.pick(req.body, [
                'name',
                'arguments',
                'service',
            ]);
            console.log('\n🗄️ [MONGO] ========== PETICIÓN MONGODB ==========');
            console.log(`📅 Timestamp: ${new Date().toISOString()}`);
            console.log(`📍 URL: ${req.url}`);
            console.log(`👤 User ID: ${req.realmUserId}`);
            try {
                await dbCore
                    .db(_callFunctions.name, _callFunctions.arguments)
                    .then((response) => {
                    res.send(response);
                })
                    .catch((err) => {
                    console.error(err);
                    const { operatorName, schemaRulesNotSatisfied } = err.errInfo.details;
                    const _schmea = schemaRulesNotSatisfied[0];
                    const error = {
                        statusCode: 400,
                        message: _schmea.operatorName,
                        model: _schmea.missingProperties[0],
                        function: _callFunctions.name,
                        ...params,
                    };
                    const _modelError = new errors_1.ApiError(400, 'Call.db'.concat(' ', _schmea.operatorName, ' ', _schmea.missingProperties));
                    console.error(_modelError, err);
                    res.send({ error });
                });
                return;
            }
            catch (error) {
                const api = new errors_1.ApiError(http_status_codes_1.default.BAD_REQUEST, _callFunctions.name);
                res.send({ error: api });
            }
        };
        // ============================================================================
        // HANDLER PARA FUNCIONES (/functions/call)
        // ============================================================================
        this.functionsCallHandler = async (req, res, _next) => {
            const dbCore = (0, provider_registry_1.inject)(db_core_1.DbCore);
            const userId = req.realmUserId;
            const params = utils_1.apiUtils.pick(req.params, [
                'id',
                'type',
                'option',
                'credetial',
                'path',
            ]);
            const _callFunctions = utils_1.apiUtils.pick(req.body, [
                'name',
                'arguments',
                'service',
            ]);
            // dbCore.prepararDatos(req.body)
            if (_callFunctions.service) {
                try {
                    await dbCore
                        .db(_callFunctions.name, _callFunctions.arguments)
                        .then((response) => {
                        res.send(response);
                    })
                        .catch((err) => {
                        console.error(err);
                        const { operatorName, schemaRulesNotSatisfied } = err.errInfo.details;
                        const _schmea = schemaRulesNotSatisfied[0];
                        const error = {
                            statusCode: 400,
                            message: _schmea.operatorName,
                            model: _schmea.missingProperties[0],
                            function: _callFunctions.name,
                            ...params,
                        };
                        const _modelError = new errors_1.ApiError(400, 'Call.db'.concat(' ', _schmea.operatorName, ' ', _schmea.missingProperties));
                        console.error(_modelError, err);
                        res.send({ error });
                    });
                    return;
                }
                catch (error) {
                    const api = new errors_1.ApiError(http_status_codes_1.default.BAD_REQUEST, _callFunctions.name);
                    res.send({ error: api });
                }
            }
            else {
                try {
                    console.log(_callFunctions);
                    const _name = _callFunctions.name;
                    const isFunction = todoFunctions[_name];
                    if (typeof isFunction === 'function') {
                        const _capture = _callFunctions.arguments[0].data;
                        const _arguments = db_utils_1.default.objectToStringParser2.parse(_capture);
                        const response = await isFunction(..._arguments).catch((err) => _next(err));
                        return res.send(response);
                    }
                }
                catch (error) {
                    const api = new errors_1.ApiError(http_status_codes_1.default.BAD_REQUEST, _callFunctions.name);
                    res.send({ error: api });
                }
            }
        };
        /**
         * Handler para peticiones GET a /functions/call (streaming)
         * Decodifica el parámetro baas_request y procesa la solicitud
         */
        this.functionsCallStreamHandler = async (req, res) => {
            try {
                const dbMongo = (0, provider_registry_1.inject)(db_mongo_1.DbMongo);
                const { baas_request } = req.query;
                if (!baas_request) {
                    throw new Error('baas_request requerido');
                }
                // Paso 1: Decodificar base64
                const decodedStr = Buffer.from(baas_request, 'base64').toString('utf-8');
                // Paso 2: Parsear JSON
                let decoded;
                try {
                    decoded = JSON.parse(decodedStr);
                }
                catch (e) {
                    console.error('Error parseando JSON:', e);
                    throw new Error('baas_request inválido');
                }
                // Paso 3: Extraer arguments
                const args = decoded.arguments || [];
                // Paso 4: Tomar el primer argumento (watchArgs)
                const watchArgs = args[0] || {};
                // Paso 5: Extraer campos
                const { database = 'samuelV1', collection = 'clients', filter = {}, ids = [] } = watchArgs;
                // Verificar si filter está anidado (por si acaso)
                let finalFilter = filter;
                if (filter.filter && typeof filter.filter === 'object') {
                    console.log('⚠️ Detectado filter anidado, aplanando:', filter);
                    finalFilter = filter.filter;
                }
                // Llamar a DbMongo.watch
                await dbMongo.watch(database, collection, { filter: finalFilter, ids }, res);
            }
            catch (error) {
                console.error('❌ Error en watchController:', error);
                if (!res.headersSent) {
                    res.status(500).send('Error en watch');
                }
            }
        };
    }
};
exports.MongoController = MongoController;
exports.MongoController = MongoController = __decorate([
    (0, injector_1.Injectable)({ providedIn: "root" })
], MongoController);
