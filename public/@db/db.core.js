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
exports.DbCore = void 0;
const injector_1 = require("@om/inyects/injector");
const db_mongo_1 = require("./db.mongo");
const db_utils_1 = __importDefault(require("./db.utils"));
let DbCore = class DbCore {
    /**
     * constructor
     */
    constructor(mongoClient) {
        this.mongoClient = mongoClient;
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------
    /**
     * Registra una función personalizada que puede ser llamada desde el cliente.
     */
    static registerFunction(name, handler) {
        this.customFunctions.set(name, handler);
    }
    async db(_name, _arguments = []) {
        let _object = {};
        for (const value of _arguments) {
            for (const key in value) {
                _object[key] = value[key];
            }
        }
        let operationType = '';
        let response;
        if (_name === 'aggregate') {
            operationType = 'aggregate';
            let pipeline = db_utils_1.default.objectToStringParser.parse(_object.pipeline);
            pipeline = db_utils_1.default.captureObjectId(pipeline);
            const result = await this.mongoClient.aggregate(_object.database, _object.collection, pipeline);
            let list = [];
            await result.forEach((doc) => {
                list.push(doc);
            });
            response = list;
        }
        else if (_name === 'updateMany') {
            operationType = 'update';
            let query = db_utils_1.default.objectToStringParser.parse(_object.query.data);
            let update = db_utils_1.default.objectToStringParser.parse(_object.update.data);
            update = db_utils_1.default.captureObjectId(update);
            query = db_utils_1.default.captureObjectId(query);
            response = await this.mongoClient.updateMany(_object.database, _object.collection, query, update);
        }
        else if (_name === 'findOneAndUpdate') {
            operationType = 'update';
            let filter = db_utils_1.default.objectToStringParser.parse(_object.filter.data);
            let update = db_utils_1.default.objectToStringParser.parse(_object.update.data);
            const options = db_utils_1.default.captureOptions(_object);
            update = db_utils_1.default.captureObjectId(update);
            filter = db_utils_1.default.captureObjectId(filter);
            response = await this.mongoClient.findOneAndUpdate(_object.database, _object.collection, filter, update, options);
            //response = await this.mongoClient.findOne(_object.database,_object.collection, filter, options);
        }
        else if (_name === 'insertMany') {
            operationType = 'insert';
            let documents = db_utils_1.default.objectToStringParser.parse(_object.documents);
            documents = db_utils_1.default.captureObjectId(documents);
            const result = await this.mongoClient.insertOne(_object.database, _object.collection, documents);
            return result;
        }
        else if (_name === 'insertOne') {
            operationType = 'insert';
            let _document = db_utils_1.default.objectToStringParser.parse(_object.document.data);
            const documentBody = db_utils_1.default.captureObjectId(_document);
            response = await this.mongoClient.insertOne(_object.database, _object.collection, documentBody);
        }
        else if (_name === 'deleteMany') {
            operationType = 'delete';
            let query = db_utils_1.default.objectToStringParser.parse(_object.query.data);
            query = db_utils_1.default.captureObjectId(query);
            await this.mongoClient.deleteMany(_object.database, _object.collection, query);
            response = query;
        }
        else if (_name === 'find') {
            operationType = 'find';
            let query = db_utils_1.default.objectToStringParser.parse(_object.query.data);
            const options = db_utils_1.default.captureOptions(_object);
            query = db_utils_1.default.captureObjectId(query);
            const cursor = await this.mongoClient.find(_object.database, _object.collection, query ?? {}, options);
            let list = [];
            await cursor.forEach((doc) => {
                list.push(doc);
            });
            response = list;
        }
        else if (_name === 'findOne') {
            operationType = 'find';
            let query = db_utils_1.default.objectToStringParser.parse(_object.query.data);
            let options = db_utils_1.default.captureOptions(_object);
            query = db_utils_1.default.captureObjectId(query);
            let _data = await this.mongoClient.findOne(_object.database, _object.collection, query, options);
            if (_data && _data.lastErrorObject) {
                response = _data.value;
            }
            else {
                response = _data;
            }
            if (response && _object.collection === 'files' && response?.data) {
                response.data = response.data.toString();
            }
        }
        else if (_name === 'deleteOne') {
            operationType = 'delete';
            let query = db_utils_1.default.objectToStringParser.parse(_object.query.data);
            const options = db_utils_1.default.captureOptions(_object);
            query = db_utils_1.default.captureObjectId(query);
            await this.mongoClient.deleteOne(_object.database, _object.collection, query);
            response = query;
        }
        response = db_utils_1.default.convertJSON(response);
        // await _CallModel.mongoClient.close();
        return response;
    }
    async prepararDatos(_arguments = []) {
        console.log(arguments);
    }
};
exports.DbCore = DbCore;
DbCore.customFunctions = new Map();
exports.DbCore = DbCore = __decorate([
    (0, injector_1.Injectable)({ providedIn: "root", dependencies: [db_mongo_1.DbMongo] }),
    __metadata("design:paramtypes", [db_mongo_1.DbMongo])
], DbCore);
//# sourceMappingURL=db.core.js.map