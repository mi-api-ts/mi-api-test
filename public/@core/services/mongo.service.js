"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoService = void 0;
exports.getMongoService = getMongoService;
const mongodb_1 = require("mongodb");
const database_1 = require("../config/database");
class MongoService {
    constructor() {
        console.log('🗄️ [MongoService] Instancia creada');
    }
    // ============================================================================
    // UTILIDADES DE CONVERSIÓN
    // ============================================================================
    convertToMongoFilter(filter = {}) {
        const mongoFilter = {};
        for (const [key, value] of Object.entries(filter)) {
            // Manejar _id
            if (key === '_id') {
                if (typeof value === 'string') {
                    mongoFilter[key] = new mongodb_1.ObjectId(value);
                }
                else if (value && typeof value === 'object' && '$oid' in value) {
                    mongoFilter[key] = new mongodb_1.ObjectId(value.$oid);
                }
                else {
                    mongoFilter[key] = value;
                }
            }
            // Manejar operadores lógicos (recursión)
            else if (key === '$and' || key === '$or' || key === '$nor') {
                if (Array.isArray(value)) {
                    mongoFilter[key] = value.map((v) => this.convertToMongoFilter(v));
                }
                else {
                    mongoFilter[key] = value;
                }
            }
            // Manejar expresiones regulares
            else if (value instanceof RegExp) {
                mongoFilter[key] = value;
            }
            // Manejar arrays (no recursivos a menos que sean objetos dentro del array)
            else if (Array.isArray(value)) {
                mongoFilter[key] = value.map((v) => {
                    if (v && typeof v === 'object' && !(v instanceof RegExp)) {
                        return this.convertToMongoFilter(v);
                    }
                    return v;
                });
            }
            // Objetos normales
            else if (value && typeof value === 'object' && !(value instanceof RegExp)) {
                mongoFilter[key] = this.convertToMongoFilter(value);
            }
            // Primitivos
            else {
                mongoFilter[key] = value;
            }
        }
        return mongoFilter;
    }
    convertToMongoUpdate(update) {
        const mongoUpdate = {};
        for (const [operator, fields] of Object.entries(update)) {
            if (operator.startsWith('$')) {
                // Preservar operadores MongoDB ($set, $inc, $push, etc.)
                mongoUpdate[operator] = fields;
            }
            else {
                // Si no tiene operador, asumimos $set (compatibilidad con sintaxis simple)
                if (!mongoUpdate.$set)
                    mongoUpdate.$set = {};
                mongoUpdate.$set = { ...mongoUpdate.$set, ...fields };
            }
        }
        return mongoUpdate;
    }
    formatDocumentForResponse(doc) {
        if (!doc)
            return null;
        const formatted = {};
        for (const [key, value] of Object.entries(doc)) {
            if (value instanceof mongodb_1.ObjectId) {
                formatted[key] = value.toHexString();
            }
            else if (value instanceof Date) {
                formatted[key] = value.toISOString();
            }
            else if (Array.isArray(value)) {
                formatted[key] = value.map((v) => this.formatDocumentForResponse(v));
            }
            else if (value && typeof value === 'object' && !(value instanceof RegExp)) {
                formatted[key] = this.formatDocumentForResponse(value);
            }
            else {
                formatted[key] = value;
            }
        }
        return formatted;
    }
    addTimestamps(document, isUpdate = false) {
        const now = new Date();
        if (!isUpdate) {
            return {
                ...document,
                createdAt: document.createdAt || now,
                updatedAt: document.updatedAt || now,
            };
        }
        else {
            return {
                ...document,
                updatedAt: document.updatedAt || now,
            };
        }
    }
    // ============================================================================
    // OPERACIONES DE CONSULTA
    // ============================================================================
    async find(databaseName, collectionName, request) {
        console.log(`🔍 [MongoService] find - ${databaseName}.${collectionName}`);
        const collection = await (0, database_1.getCollection)(databaseName, collectionName);
        const filter = this.convertToMongoFilter(request.query);
        const options = {};
        if (request.project)
            options.projection = request.project;
        if (request.sort)
            options.sort = request.sort;
        if (request.limit !== undefined)
            options.limit = request.limit;
        if (request.skip !== undefined)
            options.skip = request.skip;
        if (request.collation)
            options.collation = request.collation;
        if (request.maxTimeMS)
            options.maxTimeMS = request.maxTimeMS;
        const cursor = collection.find(filter, options);
        const results = await cursor.toArray();
        console.log(`   Resultados: ${results.length} documentos`);
        return results.map((doc) => this.formatDocumentForResponse(doc));
    }
    async findOne(databaseName, collectionName, request) {
        console.log(`🔍 [MongoService] findOne - ${databaseName}.${collectionName}`);
        const collection = await (0, database_1.getCollection)(databaseName, collectionName);
        const filter = this.convertToMongoFilter(request.query);
        const options = {};
        if (request.project)
            options.projection = request.project;
        if (request.sort)
            options.sort = request.sort;
        if (request.skip !== undefined)
            options.skip = request.skip;
        if (request.collation)
            options.collation = request.collation;
        const result = await collection.findOne(filter, options);
        return this.formatDocumentForResponse(result);
    }
    // ============================================================================
    // OPERACIONES DE INSERCIÓN
    // ============================================================================
    async insertOne(databaseName, collectionName, request) {
        console.log(`📝 [MongoService] insertOne - ${databaseName}.${collectionName}`);
        const collection = await (0, database_1.getCollection)(databaseName, collectionName);
        const document = this.addTimestamps(request.document, false);
        const result = await collection.insertOne(document);
        return {
            insertedId: result.insertedId instanceof mongodb_1.ObjectId ? result.insertedId.toHexString() : String(result.insertedId),
        };
    }
    async insertMany(databaseName, collectionName, request) {
        console.log(`📝 [MongoService] insertMany - ${databaseName}.${collectionName}`);
        console.log(`   Documentos: ${request.documents.length}`);
        const collection = await (0, database_1.getCollection)(databaseName, collectionName);
        const documents = request.documents.map((doc) => this.addTimestamps(doc, false));
        const result = await collection.insertMany(documents);
        const insertedIds = Object.values(result.insertedIds).map((id) => id instanceof mongodb_1.ObjectId ? id.toHexString() : String(id));
        return { insertedIds };
    }
    // ============================================================================
    // OPERACIONES DE ACTUALIZACIÓN
    // ============================================================================
    async updateOne(databaseName, collectionName, request) {
        console.log(`✏️ [MongoService] updateOne - ${databaseName}.${collectionName}`);
        const collection = await (0, database_1.getCollection)(databaseName, collectionName);
        const filter = this.convertToMongoFilter(request.query);
        let update = this.convertToMongoUpdate(request.update);
        if (!update.$set)
            update.$set = {};
        update.$set.updatedAt = new Date();
        const options = {};
        if (request.upsert !== undefined)
            options.upsert = request.upsert;
        if (request.arrayFilters)
            options.arrayFilters = request.arrayFilters;
        if (request.collation)
            options.collation = request.collation;
        const result = await collection.updateOne(filter, update, options);
        const response = {
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount,
        };
        if (result.upsertedId) {
            response.upsertedId = result.upsertedId instanceof mongodb_1.ObjectId ? result.upsertedId.toHexString() : String(result.upsertedId);
        }
        console.log(`   Matched: ${response.matchedCount}, Modified: ${response.modifiedCount}`);
        return response;
    }
    async updateMany(databaseName, collectionName, request) {
        console.log(`✏️ [MongoService] updateMany - ${databaseName}.${collectionName}`);
        const collection = await (0, database_1.getCollection)(databaseName, collectionName);
        const filter = this.convertToMongoFilter(request.query);
        let update = this.convertToMongoUpdate(request.update);
        if (!update.$set)
            update.$set = {};
        update.$set.updatedAt = new Date();
        const options = {};
        if (request.upsert !== undefined)
            options.upsert = request.upsert;
        if (request.arrayFilters)
            options.arrayFilters = request.arrayFilters;
        if (request.collation)
            options.collation = request.collation;
        const result = await collection.updateMany(filter, update, options);
        return {
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount,
        };
    }
    async replaceOne(databaseName, collectionName, request) {
        console.log(`🔄 [MongoService] replaceOne - ${databaseName}.${collectionName}`);
        const collection = await (0, database_1.getCollection)(databaseName, collectionName);
        const filter = this.convertToMongoFilter(request.query);
        const replacement = this.addTimestamps(request.replacement, true);
        const options = {};
        if (request.upsert !== undefined)
            options.upsert = request.upsert;
        const result = await collection.replaceOne(filter, replacement, options);
        const response = {
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount,
        };
        if (result.upsertedId) {
            response.upsertedId = result.upsertedId instanceof mongodb_1.ObjectId ? result.upsertedId.toHexString() : String(result.upsertedId);
        }
        return response;
    }
    // ============================================================================
    // OPERACIONES DE ELIMINACIÓN
    // ============================================================================
    async deleteOne(databaseName, collectionName, request) {
        console.log(`🗑️ [MongoService] deleteOne - ${databaseName}.${collectionName}`);
        const collection = await (0, database_1.getCollection)(databaseName, collectionName);
        const filter = this.convertToMongoFilter(request.query);
        const result = await collection.deleteOne(filter);
        return { deletedCount: result.deletedCount };
    }
    async deleteMany(databaseName, collectionName, request) {
        console.log(`🗑️ [MongoService] deleteMany - ${databaseName}.${collectionName}`);
        const collection = await (0, database_1.getCollection)(databaseName, collectionName);
        const filter = this.convertToMongoFilter(request.query);
        const result = await collection.deleteMany(filter);
        return { deletedCount: result.deletedCount };
    }
    // ============================================================================
    // OPERACIONES DE AGREGACIÓN
    // ============================================================================
    async aggregate(databaseName, collectionName, request) {
        console.log(`📊 [MongoService] aggregate - ${databaseName}.${collectionName}`);
        const collection = await (0, database_1.getCollection)(databaseName, collectionName);
        const pipeline = request.pipeline || [];
        const cursor = collection.aggregate(pipeline);
        const results = await cursor.toArray();
        return results.map((doc) => this.formatDocumentForResponse(doc));
    }
    // ============================================================================
    // OPERACIÓN COUNT
    // ============================================================================
    async count(databaseName, collectionName, request) {
        console.log(`🔢 [MongoService] count - ${databaseName}.${collectionName}`);
        const collection = await (0, database_1.getCollection)(databaseName, collectionName);
        const filter = this.convertToMongoFilter(request.query);
        const options = {};
        if (request.limit !== undefined)
            options.limit = request.limit;
        return collection.countDocuments(filter, options);
    }
    // ============================================================================
    // OPERACIONES FIND ONE AND MODIFY (respuesta simplificada)
    // ============================================================================
    async findOneAndUpdate(databaseName, collectionName, request) {
        console.log(`🔧 [MongoService] findOneAndUpdate - ${databaseName}.${collectionName}`);
        const collection = await (0, database_1.getCollection)(databaseName, collectionName);
        const filter = this.convertToMongoFilter(request.query);
        let update = this.convertToMongoUpdate(request.update);
        if (!update.$set)
            update.$set = {};
        update.$set.updatedAt = new Date();
        const options = {
            returnDocument: request.returnNewDocument === true ? 'after' : 'before',
            upsert: request.upsert || false,
        };
        if (request.sort)
            options.sort = request.sort;
        if (request.projection)
            options.projection = request.projection;
        const result = await collection.findOneAndUpdate(filter, update, options);
        return { value: this.formatDocumentForResponse(result.value) };
    }
    async findOneAndReplace(databaseName, collectionName, request) {
        console.log(`🔄 [MongoService] findOneAndReplace - ${databaseName}.${collectionName}`);
        const collection = await (0, database_1.getCollection)(databaseName, collectionName);
        const filter = this.convertToMongoFilter(request.query);
        const replacement = this.addTimestamps(request.replacement, true);
        const options = {
            returnDocument: request.returnNewDocument === true ? 'after' : 'before',
            upsert: request.upsert || false,
        };
        if (request.sort)
            options.sort = request.sort;
        if (request.projection)
            options.projection = request.projection;
        const result = await collection.findOneAndReplace(filter, replacement, options);
        return { value: this.formatDocumentForResponse(result.value) };
    }
    async findOneAndDelete(databaseName, collectionName, request) {
        console.log(`🗑️ [MongoService] findOneAndDelete - ${databaseName}.${collectionName}`);
        const collection = await (0, database_1.getCollection)(databaseName, collectionName);
        const filter = this.convertToMongoFilter(request.query);
        const options = {};
        if (request.sort)
            options.sort = request.sort;
        if (request.projection)
            options.projection = request.projection;
        const result = await collection.findOneAndDelete(filter, options);
        return { value: this.formatDocumentForResponse(result.value) };
    }
}
exports.MongoService = MongoService;
// Singleton
let mongoServiceInstance = null;
function getMongoService() {
    if (!mongoServiceInstance) {
        mongoServiceInstance = new MongoService();
    }
    return mongoServiceInstance;
}
//# sourceMappingURL=mongo.service.js.map