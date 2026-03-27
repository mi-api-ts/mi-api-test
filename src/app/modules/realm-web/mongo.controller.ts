import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import { AuthenticatedRequest } from "@core/auth.middleware";
import { apiUtils } from "@core/utils";
import { DbCore } from "@db/db.core";
import { Injectable } from "@om/inyects/injector";
import { inject } from "@om/inyects/provider.registry";
import dbUtils from '@db/db.utils';
import { DbMongo } from '@db/db.mongo';
import { ApiError } from '@core/errors';

const todoFunctions = {


};


@Injectable({ providedIn: "root" })
export class MongoController {



    // ============================================================================
    // HANDLER PARA OPERACIONES DE COLECCIÓN (find, insertOne, etc.)
    // ============================================================================

    mongoOperationHandler = async (req: AuthenticatedRequest, res: Response) => {
        const dbCore = inject(DbCore)
        const params = apiUtils.pick(req.params, [
            'id',
            'type',
            'option',
            'credetial',
            'path',
        ]);
        const _callFunctions = apiUtils.pick(req.body, [
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

                    const { operatorName, schemaRulesNotSatisfied } =
                        err.errInfo.details;

                    const _schmea = schemaRulesNotSatisfied[0];

                    const error = {
                        statusCode: 400,
                        message: _schmea.operatorName,
                        model: _schmea.missingProperties[0],
                        function: _callFunctions.name,
                        ...params,
                    };

                    const _modelError = new ApiError(
                        400,
                        'Call.db'.concat(
                            ' ',
                            _schmea.operatorName,
                            ' ',
                            _schmea.missingProperties
                        )
                    );
                    console.error(_modelError, err);

                    res.send({ error });
                });

            return;
        } catch (error) {
            const api = new ApiError(
                httpStatus.BAD_REQUEST,
                _callFunctions.name
            );

            res.send({ error: api });
        }

    };

    // ============================================================================
    // HANDLER PARA FUNCIONES (/functions/call)
    // ============================================================================

    functionsCallHandler = async (req: AuthenticatedRequest, res: Response, _next: any) => {
        const dbCore = inject(DbCore)
        const userId = req.realmUserId;
        const params = apiUtils.pick(req.params, [
            'id',
            'type',
            'option',
            'credetial',
            'path',
        ]);
        const _callFunctions = apiUtils.pick(req.body, [
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

                        const { operatorName, schemaRulesNotSatisfied } =
                            err.errInfo.details;

                        const _schmea = schemaRulesNotSatisfied[0];

                        const error = {
                            statusCode: 400,
                            message: _schmea.operatorName,
                            model: _schmea.missingProperties[0],
                            function: _callFunctions.name,
                            ...params,
                        };

                        const _modelError = new ApiError(
                            400,
                            'Call.db'.concat(
                                ' ',
                                _schmea.operatorName,
                                ' ',
                                _schmea.missingProperties
                            )
                        );
                        console.error(_modelError, err);

                        res.send({ error });
                    });

                return;
            } catch (error) {
                const api = new ApiError(
                    httpStatus.BAD_REQUEST,
                    _callFunctions.name
                );

                res.send({ error: api });
            }

        }
        else {
            try {
                console.log(_callFunctions)

                const _name = _callFunctions.name;
                const isFunction = todoFunctions[_name];

                if (typeof isFunction === 'function') {
                    const _capture = _callFunctions.arguments[0].data
                    const _arguments = dbUtils.objectToStringParser2.parse(_capture)
                    const response = await isFunction(..._arguments).catch((err) => _next(err));

                    return res.send(response);
                }

            } catch (error) {
                const api = new ApiError(
                    httpStatus.BAD_REQUEST,
                    _callFunctions.name
                );

                res.send({ error: api });
            }

        }

    };


    /**
     * Handler para peticiones GET a /functions/call (streaming)
     * Decodifica el parámetro baas_request y procesa la solicitud
     */
    functionsCallStreamHandler = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const dbMongo = inject(DbMongo)
            const { baas_request } = req.query;

            if (!baas_request) {
                throw new Error('baas_request requerido');
            }

            // Paso 1: Decodificar base64
            const decodedStr = Buffer.from(baas_request as string, 'base64').toString('utf-8');

            // Paso 2: Parsear JSON
            let decoded;
            try {
                decoded = JSON.parse(decodedStr);
            } catch (e) {
                console.error('Error parseando JSON:', e);
                throw new Error('baas_request inválido');
            }

            // Paso 3: Extraer arguments
            const args = decoded.arguments || [];


            // Paso 4: Tomar el primer argumento (watchArgs)
            const watchArgs = args[0] || {};

            // Paso 5: Extraer campos
            const {
                database = 'samuelV1',
                collection = 'clients',
                filter = {},
                ids = []
            } = watchArgs;


            // Verificar si filter está anidado (por si acaso)
            let finalFilter = filter;
            if (filter.filter && typeof filter.filter === 'object') {
                console.log('⚠️ Detectado filter anidado, aplanando:', filter);
                finalFilter = filter.filter;
            }

            // Llamar a DbMongo.watch
            await dbMongo.watch(database, collection, { filter: finalFilter, ids }, res);

        } catch (error) {
            console.error('❌ Error en watchController:', error);
            if (!res.headersSent) {
                res.status(500).send('Error en watch');
            }
        }
    };
}