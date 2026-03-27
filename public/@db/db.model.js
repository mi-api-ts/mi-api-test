"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbModel = exports.ApiEvent = void 0;
/* eslint-disable no-unused-vars */
const events_1 = __importDefault(require("events"));
const moment_1 = __importDefault(require("moment"));
const db_utils_1 = __importDefault(require("./db.utils"));
const db_mongo_1 = require("./db.mongo");
const injector_1 = require("@om/inyects/injector");
let ApiEvent = class ApiEvent extends events_1.default {
    constructor() {
        super();
        super.setMaxListeners(0);
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------
    // Method for emitting an event using .emit
    send(event, data) {
        this.emit(event, data);
    }
    method(event, listener) {
        /**
         * filtramos los eventos
         */
        this.on('method', (result) => {
            const { colection, ...body } = result;
            if (event === colection) {
                listener(body);
            }
            else {
            }
        });
        return this;
    }
    pre(event, listener) {
        /**
         * filtramos los eventos
         */
        this.on('pre', (result) => {
            const { colection, ...body } = result;
            if (event === colection) {
                listener(body);
            }
            else {
            }
        });
        return this;
    }
};
exports.ApiEvent = ApiEvent;
exports.ApiEvent = ApiEvent = __decorate([
    (0, injector_1.Injectable)({ providedIn: "root" }),
    __metadata("design:paramtypes", [])
], ApiEvent);
let DbModel = class DbModel {
    /**
     * constructor
     */
    constructor(_mong, _apiEvent) {
        this._mong = _mong;
        this._apiEvent = _apiEvent;
        this.database = 'abogadoV1';
        this._functionsDb = {
            updateMany: this.updateMany,
            insertMany: this.insertMany,
            deleteMany: this.deleteMany,
            aggregate: this.aggregate,
            find: this.find,
            findOne: this.findOne,
            deleteOne: this.deleteOne,
            insertOne: this.insertOne,
            findOneAndUpdate: this.findOneAndUpdate,
        };
        this.mongoClient = _mong;
    }
    //#region  MODELOS
    get Authorize() {
        this.collection = 'authorizes';
        return this._functionsDb;
    }
    //#endregion
    async findOne(query = {}, options, _schema = []) {
        const client = await this.mongoClient.connect;
        let _collection = client
            .db(this.database)
            .collection(this.collection);
        query = db_utils_1.default.captureObjectId(query);
        let response;
        if (options) {
            options = db_utils_1.default.captureObjectId(options);
        }
        if (_schema && _schema.length > 0) {
            response = (await this.fullSchema(query, _schema, options))[0];
        }
        else {
            if (options && query) {
                response = await _collection.findOne(query, options);
            }
            else if (query && !options) {
                response = await _collection.findOne(query);
            }
            else {
                response = await _collection.findOne({});
            }
        }
        response = db_utils_1.default.convertJSON(response);
        return response;
    }
    /**
     *
     * @param body
     * @returns
     */
    async insertOne(body, options = {}, _schema = []) {
        const client = await this.mongoClient.connect;
        let _collection = client
            .db(this.database)
            .collection(this.collection);
        const eventModel = this._apiEvent;
        const updatedAt = (0, moment_1.default)().unix();
        const createdAt = (0, moment_1.default)().unix();
        const { id, ...resto } = body;
        body = db_utils_1.default.captureObjectId(resto);
        body = Object.assign(body, { updatedAt, createdAt });
        let data = await _collection.insertOne(body);
        let response;
        if (_schema && _schema.length > 0) {
            response = (await this.fullSchema({ _id: data.insertedId }, _schema))[0];
            eventModel.send('method', {
                event: 'create',
                body: body,
                response,
                colection: this.collection,
            });
        }
        else if (Object.keys(options).length > 0) {
            response = await this.findOne({ _id: data.insertedId }, options, _schema);
            eventModel.send('method', {
                event: 'create',
                body: body,
                response,
                colection: this.collection,
            });
        }
        else {
            response = await this.findOne({ _id: data.insertedId }, null, _schema);
            eventModel.send('method', {
                event: 'create',
                body: body,
                response,
                colection: this.collection,
            });
        }
        response = db_utils_1.default.convertJSON(response);
        return response;
    }
    async deleteOne(query) {
        const client = await this.mongoClient.connect;
        let _collection = client
            .db(this.database)
            .collection(this.collection);
        const eventModel = this._apiEvent;
        query = db_utils_1.default.captureObjectId(query);
        let response = await _collection.findOneAndDelete(query);
        eventModel.send('method', {
            event: 'remove',
            body: query,
            response: response.value,
            colection: this.collection,
        });
        return !!response;
    }
    async deleteMany(query) {
        const client = await this.mongoClient.connect;
        let _collection = client
            .db(this.database)
            .collection(this.collection);
        query = db_utils_1.default.captureObjectId(query);
        let data = await _collection.deleteMany(query);
        return !!data;
    }
    async updateMany(query, body) {
        const client = await this.mongoClient.connect;
        let _collection = client
            .db(this.database)
            .collection(this.collection);
        query = db_utils_1.default.captureObjectId(query);
        body = db_utils_1.default.captureObjectId(body);
        const updatedAt = (0, moment_1.default)().unix();
        const data = await _collection.updateMany(query, {
            $set: {
                ...body,
                updatedAt,
            },
        });
        return data;
    }
    async insertMany(query) {
        const client = await this.mongoClient.connect;
        let _collection = client
            .db(this.database)
            .collection(this.collection);
        query = db_utils_1.default.captureObjectId(query);
        const updatedAt = (0, moment_1.default)().unix();
        const createdAt = (0, moment_1.default)().unix();
        query = query.map((x) => ({ ...x, createdAt, updatedAt }));
        const data = await _collection.insertMany(query);
        return data;
    }
    async find(filter = {}, options, _schema = []) {
        const client = await this.mongoClient.connect;
        let _collection = client
            .db(this.database)
            .collection(this.collection);
        filter = db_utils_1.default.captureObjectId(filter);
        let response;
        if (options) {
            options = db_utils_1.default.captureObjectId(options);
        }
        if (_schema.length > 0) {
            response = await this.fullSchema(filter, _schema, options);
        }
        else {
            let cursor;
            if (options && filter) {
                cursor = await _collection.find(filter, options);
            }
            else if (filter && !options) {
                cursor = await _collection.find(filter);
            }
            else {
                cursor = await _collection.find({});
            }
            let list = [];
            await cursor.forEach((doc) => {
                list.push(doc);
            });
            response = list;
        }
        response = db_utils_1.default.convertJSON(response);
        return response;
    }
    /**
     *
     * @param pipeline
     * @param options
     * @returns
     */
    async aggregate(pipeline, options) {
        const client = await this.mongoClient.connect;
        let _collection = client
            .db(this.database)
            .collection(this.collection);
        pipeline = db_utils_1.default.captureObjectId(pipeline);
        const result = await _collection.aggregate(pipeline);
        let list = [];
        await result.forEach((doc) => {
            list.push(doc);
        });
        list = db_utils_1.default.convertJSON(list);
        return list;
    }
    async fullSchema(_filter = {}, _schema = [], _options) {
        let modelos = [];
        let unwind = [];
        const filterModel = { $match: _filter };
        const options = [];
        if (_options && _options.projection) {
            const modelo = { $project: { ..._options.projection } };
            options.push(modelo);
        }
        for (const value of _schema) {
            if (value === 'user') {
                const data = {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'user',
                    },
                };
                modelos.push(data);
                const wind = {
                    $unwind: {
                        path: '$user',
                        preserveNullAndEmptyArrays: true,
                    },
                };
                unwind.push(wind);
            }
            else if (value === 'tags') {
                const data = {
                    $lookup: {
                        from: 'tags',
                        localField: 'tags',
                        foreignField: '_id',
                        as: 'tags',
                    },
                };
                modelos.push(data);
            }
            else if (value === 'taskGroup') {
                const data = {
                    $lookup: {
                        from: 'tasks',
                        localField: 'group',
                        foreignField: '_id',
                        as: 'group',
                    },
                };
                modelos.push(data);
                const wind = {
                    $unwind: {
                        path: '$group',
                        preserveNullAndEmptyArrays: true,
                    },
                };
                unwind.push(wind);
            }
            else if (value === 'role') {
                const data = {
                    $lookup: {
                        from: 'roles',
                        localField: 'roleId',
                        foreignField: '_id',
                        as: 'role',
                    },
                };
                modelos.push(data);
                const wind = {
                    $unwind: {
                        path: '$role',
                        preserveNullAndEmptyArrays: true,
                    },
                };
                unwind.push(wind);
            }
            else if (value === 'norma') {
                const data = {
                    $lookup: {
                        from: 'normas',
                        localField: 'normaId',
                        foreignField: '_id',
                        as: 'norma',
                    },
                };
                modelos.push(data);
                const wind = {
                    $unwind: {
                        path: '$norma',
                        preserveNullAndEmptyArrays: true,
                    },
                };
                unwind.push(wind);
            }
            else if (value === 'articulos') {
                const data = {
                    $lookup: {
                        from: 'articulos',
                        localField: '_id',
                        foreignField: 'normaId',
                        as: 'articulos',
                    },
                };
                modelos.push(data);
            }
            else if (value === 'authorizes') {
                const data = {
                    $lookup: {
                        from: 'authorizes',
                        let: { roleId: '$roleId', id: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            {
                                                $eq: [
                                                    '$roleId',
                                                    {
                                                        $ifNull: [
                                                            '$$roleId',
                                                            '$$id',
                                                        ],
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                },
                            },
                        ],
                        as: 'authorizes',
                    },
                };
                modelos.push(data);
            }
            else if (value === 'group') {
                const data = {
                    $lookup: {
                        from: 'services',
                        localField: 'serviceIds',
                        foreignField: '_id',
                        as: 'group',
                    },
                };
                modelos.push(data);
            }
            else if (value === 'subrsts') {
                const data = {
                    $lookup: {
                        from: 'subrsts',
                        localField: '_id',
                        foreignField: 'serviceId',
                        as: 'subrsts',
                    },
                };
                modelos.push(data);
            }
            else if (value === 'phone') {
                const data = {
                    $lookup: {
                        from: 'phones',
                        localField: '_id',
                        foreignField: 'moduleId',
                        as: 'phone',
                    },
                };
                modelos.push(data);
                const wind = {
                    $unwind: {
                        path: '$phone',
                        preserveNullAndEmptyArrays: true,
                    },
                };
                unwind.push(wind);
            }
            else if (value === 'company') {
                const data = {
                    $lookup: {
                        from: 'companies',
                        localField: 'companyId',
                        foreignField: '_id',
                        as: 'company',
                    },
                };
                modelos.push(data);
                const wind = {
                    $unwind: {
                        path: '$company',
                        preserveNullAndEmptyArrays: true,
                    },
                };
                unwind.push(wind);
            }
            else if (value === 'movservs') {
                const data = {
                    $lookup: {
                        from: 'movservs',
                        localField: 'movordId',
                        foreignField: '_id',
                        as: 'movservs',
                    },
                };
                modelos.push(data);
            }
            else if (value === 'labels') {
                const data = {
                    $lookup: {
                        from: 'labels',
                        localField: 'labelIds',
                        foreignField: '_id',
                        as: 'labels',
                    },
                };
                modelos.push(data);
            }
        }
        const response = await this.aggregate([
            filterModel,
            ...modelos,
            ...unwind,
            ...options,
        ]);
        //const values = await UtilsMongo.convertJSON(response)
        return response;
    }
    async findOneAndUpdate(query, _body, options, _schema = []) {
        const client = await this.mongoClient.connect;
        let _collection = client
            .db(this.database)
            .collection(this.collection);
        const eventModel = this._apiEvent;
        const updatedAt = (0, moment_1.default)().unix();
        query = db_utils_1.default.captureObjectId(query);
        _body = db_utils_1.default.captureObjectId(_body);
        _body = Object.assign(_body, { ..._body, updatedAt });
        let _data = await _collection.findOneAndReplace(query, _body);
        if (_data.lastErrorObject) {
            _data = _data.value;
        }
        let response;
        if (_schema.length > 0) {
            response = (await this.fullSchema(query, _schema))[0];
        }
        else if (options) {
            response = await _collection.findOne(query, options);
        }
        else {
            response = await _collection.findOne(query);
        }
        response = db_utils_1.default.convertJSON(response);
        return response;
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle functions
    // -----------------------------------------------------------------------------------------------------
    captureChange(value) {
        const _list = [];
        for (const protype in value) {
            _list.push(protype);
        }
        return _list;
    }
};
exports.DbModel = DbModel;
exports.DbModel = DbModel = __decorate([
    (0, injector_1.Injectable)({ providedIn: "root", dependencies: [db_mongo_1.DbMongo, ApiEvent] }),
    __metadata("design:paramtypes", [db_mongo_1.DbMongo, ApiEvent])
], DbModel);
//# sourceMappingURL=db.model.js.map