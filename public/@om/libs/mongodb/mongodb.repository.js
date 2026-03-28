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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoDBRepository = void 0;
const mongodb_1 = require("mongodb");
const injector_1 = require("@om/inyects/injector");
let MongoDBRepository = class MongoDBRepository {
    constructor() {
        this.collectionName = '';
        this.client = null;
        this.db = null;
        this.isConnected = false;
    }
    /**
     * Conectar a la base de datos MongoDB
     */
    async connectDB(uri, dbName, options) {
        try {
            this.client = await mongodb_1.MongoClient.connect(uri, options || {});
            this.db = this.client.db(dbName);
            this.isConnected = true;
            console.log(`✅ Conectado a MongoDB: ${dbName}`);
        }
        catch (error) {
            console.error('❌ Error conectando a MongoDB:', error);
            this.isConnected = false;
            throw error;
        }
    }
    /**
     * Especificar la colección a utilizar
     */
    connectCollection(collectionName) {
        this.collectionName = collectionName;
    }
    /**
     * Verificar si está conectado a la base de datos
     */
    isDBConnected() {
        return this.isConnected;
    }
    /**
     * Obtener la colección actual
     */
    async getCollection() {
        if (!this.db || !this.isConnected) {
            throw new Error('Base de datos no conectada');
        }
        if (!this.collectionName) {
            throw new Error('Nombre de colección no especificado');
        }
        return this.db.collection(this.collectionName);
    }
    /**
     * Desconectar de la base de datos
     */
    async disconnect() {
        if (this.client) {
            await this.client.close();
            this.isConnected = false;
            this.db = null;
            this.client = null;
        }
    }
    // ============ MÉTODOS CRUD ============
    /**
     * CREATE - Crear un nuevo documento
     */
    async create(data) {
        try {
            const collection = await this.getCollection();
            const document = {
                ...data,
                createdAt: data.createdAt || new Date(),
                updatedAt: new Date()
            };
            const result = await collection.insertOne(document);
            const createdDoc = {
                ...document,
                _id: result.insertedId
            };
            return createdDoc;
        }
        catch (error) {
            console.error('Error en create:', error);
            throw error;
        }
    }
    /**
     * CREATE - Crear múltiples documentos
     */
    async createMany(data) {
        try {
            const collection = await this.getCollection();
            const documents = data.map(doc => ({
                ...doc,
                createdAt: doc.createdAt || new Date(),
                updatedAt: new Date()
            }));
            const result = await collection.insertMany(documents);
            // Asignar los IDs generados a cada documento
            const createdDocs = documents.map((doc, index) => ({
                ...doc,
                _id: result.insertedIds[index]
            }));
            return createdDocs;
        }
        catch (error) {
            console.error('Error en createMany:', error);
            throw error;
        }
    }
    /**
     * READ - Encontrar un documento por filtro
     */
    async findOne(filter, options) {
        try {
            const collection = await this.getCollection();
            const findOptions = {};
            // Proyección (select)
            if (options?.select) {
                findOptions.projection = this.parseProjection(options.select);
            }
            // Skip y Limit
            if (options?.skip !== undefined) {
                findOptions.skip = options.skip;
            }
            if (options?.limit !== undefined) {
                findOptions.limit = options.limit;
            }
            const doc = await collection.findOne(filter, findOptions);
            return this.convertToModel(doc);
        }
        catch (error) {
            console.error('Error en findOne:', error);
            throw error;
        }
    }
    /**
     * READ - Encontrar documento por ID
     */
    async findById(id) {
        try {
            const objectId = typeof id === 'string' ? new mongodb_1.ObjectId(id) : id;
            return await this.findOne({ _id: objectId });
        }
        catch (error) {
            console.error('Error en findById:', error);
            throw error;
        }
    }
    /**
     * READ - Encontrar múltiples documentos
     */
    async find(filter = {}, options) {
        try {
            const collection = await this.getCollection();
            const findOptions = {};
            // Proyección (select)
            if (options?.select) {
                findOptions.projection = this.parseProjection(options.select);
            }
            // Ordenación
            if (options?.sort) {
                findOptions.sort = this.parseSort(options.sort);
            }
            // Paginación
            if (options?.skip !== undefined) {
                findOptions.skip = options.skip;
            }
            if (options?.limit !== undefined) {
                findOptions.limit = options.limit;
            }
            const cursor = collection.find(filter, findOptions);
            const docs = await cursor.toArray();
            return docs.map(doc => this.convertToModel(doc));
        }
        catch (error) {
            console.error('Error en find:', error);
            throw error;
        }
    }
    /**
     * UPDATE - Actualizar un documento
     */
    async updateOne(filter, update, options = {}) {
        try {
            const collection = await this.getCollection();
            // Preparar el documento de actualización
            const updateDoc = {
                $set: {
                    ...update,
                    updatedAt: new Date()
                }
            };
            const result = await collection.updateOne(filter, updateDoc, {
                upsert: options.upsert || false
            });
            return result.modifiedCount > 0 || result.upsertedCount > 0;
        }
        catch (error) {
            console.error('Error en updateOne:', error);
            throw error;
        }
    }
    /**
     * UPDATE - Actualizar múltiples documentos
     */
    async updateMany(filter, update, options = {}) {
        try {
            const collection = await this.getCollection();
            const updateDoc = {
                $set: {
                    ...update,
                    updatedAt: new Date()
                }
            };
            const result = await collection.updateMany(filter, updateDoc, {
                upsert: options.upsert || false
            });
            return result.modifiedCount;
        }
        catch (error) {
            console.error('Error en updateMany:', error);
            throw error;
        }
    }
    /**
     * UPDATE - Encontrar y actualizar un documento
     */
    async findOneAndUpdate(filter, update, options = {}) {
        try {
            const collection = await this.getCollection();
            const updateDoc = {
                $set: {
                    ...update,
                    updatedAt: new Date()
                }
            };
            const result = await collection.findOneAndUpdate(filter, updateDoc, {
                returnDocument: options.returnOriginal ? 'before' : 'after',
                upsert: options.upsert || false,
                includeResultMetadata: true
            });
            if (!result || !result.value) {
                return null;
            }
            return this.convertToModel(result.value);
        }
        catch (error) {
            console.error('Error en findOneAndUpdate:', error);
            throw error;
        }
    }
    /**
     * DELETE - Eliminar un documento
     */
    async deleteOne(filter) {
        try {
            const collection = await this.getCollection();
            const result = await collection.deleteOne(filter);
            return result.deletedCount > 0;
        }
        catch (error) {
            console.error('Error en deleteOne:', error);
            throw error;
        }
    }
    /**
     * DELETE - Eliminar por ID
     */
    async deleteById(id) {
        try {
            const objectId = typeof id === 'string' ? new mongodb_1.ObjectId(id) : id;
            return await this.deleteOne({ _id: objectId });
        }
        catch (error) {
            console.error('Error en deleteById:', error);
            throw error;
        }
    }
    /**
     * DELETE - Eliminar múltiples documentos
     */
    async deleteMany(filter) {
        try {
            const collection = await this.getCollection();
            const result = await collection.deleteMany(filter);
            return result.deletedCount;
        }
        catch (error) {
            console.error('Error en deleteMany:', error);
            throw error;
        }
    }
    // ============ MÉTODOS DE CONSULTA ============
    /**
     * COUNT - Contar documentos
     */
    async count(filter = {}) {
        try {
            const collection = await this.getCollection();
            return await collection.countDocuments(filter);
        }
        catch (error) {
            console.error('Error en count:', error);
            throw error;
        }
    }
    /**
     * EXISTS - Verificar si existe un documento
     */
    async exists(filter) {
        try {
            const collection = await this.getCollection();
            const doc = await collection.findOne(filter, { projection: { _id: 1 } });
            return !!doc;
        }
        catch (error) {
            console.error('Error en exists:', error);
            throw error;
        }
    }
    /**
     * AGGREGATE - Ejecutar pipeline de agregación
     */
    async aggregate(pipeline) {
        try {
            const collection = await this.getCollection();
            return await collection.aggregate(pipeline).toArray();
        }
        catch (error) {
            console.error('Error en aggregate:', error);
            throw error;
        }
    }
    // ============ MÉTODOS HELPER ============
    /**
     * Convertir documento MongoDB a modelo
     */
    convertToModel(doc) {
        if (!doc)
            return null;
        return doc;
    }
    /**
     * Parsear proyección (select)
     */
    parseProjection(select) {
        if (typeof select === 'string') {
            const fields = select.split(' ').filter(f => f.trim());
            const projection = {};
            fields.forEach(field => {
                const trimmed = field.trim();
                if (trimmed.startsWith('-')) {
                    projection[trimmed.substring(1)] = 0;
                }
                else {
                    projection[trimmed] = 1;
                }
            });
            return projection;
        }
        return select;
    }
    /**
     * Parsear ordenación (sort)
     */
    parseSort(sort) {
        if (typeof sort === 'string') {
            const fields = sort.split(' ').filter(f => f.trim());
            const sortObj = {};
            fields.forEach(field => {
                const trimmed = field.trim();
                if (trimmed.startsWith('-')) {
                    sortObj[trimmed.substring(1)] = -1;
                }
                else {
                    sortObj[trimmed] = 1;
                }
            });
            return sortObj;
        }
        return sort;
    }
    // ============ MÉTODOS ADICIONALES ============
    /**
     * Obtener instancia de la base de datos
     */
    getDatabase() {
        return this.db;
    }
    /**
     * Obtener nombre de la colección
     */
    getCollectionName() {
        return this.collectionName;
    }
    /**
     * Verificar conexión con ping
     */
    async ping() {
        if (!this.db || !this.isConnected) {
            return false;
        }
        try {
            await this.db.command({ ping: 1 });
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Crear índice
     */
    async createIndex(keys, options) {
        try {
            const collection = await this.getCollection();
            return await collection.createIndex(keys, options);
        }
        catch (error) {
            console.error('Error creando índice:', error);
            throw error;
        }
    }
    /**
     * Obtener índices
     */
    async listIndexes() {
        try {
            const collection = await this.getCollection();
            return await collection.indexes();
        }
        catch (error) {
            console.error('Error listando índices:', error);
            throw error;
        }
    }
    /**
     * Transacción (ejemplo básico)
     */
    async withTransaction(operation) {
        if (!this.client) {
            throw new Error('Cliente MongoDB no disponible');
        }
        const session = this.client.startSession();
        try {
            let result;
            await session.withTransaction(async () => {
                result = await operation(session);
            });
            return result;
        }
        finally {
            await session.endSession();
        }
    }
};
exports.MongoDBRepository = MongoDBRepository;
exports.MongoDBRepository = MongoDBRepository = __decorate([
    (0, injector_1.Injectable)({ providedIn: "root" }),
    __metadata("design:paramtypes", [])
], MongoDBRepository);
//# sourceMappingURL=mongodb.repository.js.map