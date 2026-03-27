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
exports.DbMongo = void 0;
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-unused-vars */
/* eslint-disable no-async-promise-executor */
/* eslint-disable no-case-declarations */
const mongodb_1 = require("mongodb");
const injector_1 = require("@om/inyects/injector");
const { EJSON } = require('bson');
let DbMongo = class DbMongo {
    constructor() {
        this.activeWatchers = new Map();
        this.changeCounter = 0;
        // GC automático cada 30 segundos
        setInterval(() => this.cleanDeadWatchers(), 30000);
    }
    /**
     * Limpia watchers con conexiones muertas
     */
    cleanDeadWatchers() {
        for (const [key, watchers] of this.activeWatchers) {
            for (const w of watchers) {
                if (!w.res?.writable || w.res.finished) {
                    watchers.delete(w);
                }
            }
            if (watchers.size === 0)
                this.activeWatchers.delete(key);
        }
    }
    /**
     * Obtiene o inicializa la conexión a MongoDB
     */
    get connect() {
        if (this._connect) {
            return Promise.resolve(this._connect);
        }
        const uri = "mongodb+srv://albertocoronado2025_db_user:0bwmK1q3Dl59AGDy@cluster0.vzc1nb8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
        return new Promise(async (resolve, reject) => {
            try {
                const client = new mongodb_1.MongoClient(uri);
                const cnn = await client.connect();
                this._connect = cnn;
                console.log('✅ Conectado a MongoDB (modo standalone)');
                resolve(cnn);
            }
            catch (error) {
                reject(error);
            }
        });
    }
    // ============================================
    // SISTEMA DE NOTIFICACIONES (SOLO SSE)
    // ============================================
    /**
     * Notifica un cambio a todos los suscriptores SSE
     */
    notifyChange(change) {
        const token = `${Date.now()}_${++this.changeCounter}`;
        const normalizedOperation = change.operation || change.operationType || 'unknown';
        const enrichedChange = {
            ...change,
            operationType: normalizedOperation,
            _id: { _data: token },
            clusterTime: { $timestamp: { t: Math.floor(Date.now() / 1000), i: 1 } }
        };
        const key = `${change.database}.${change.collection}`;
        const watchers = this.activeWatchers.get(key);
        if (!watchers?.size) {
            console.log(`[SSE] No hay watchers para ${key}`);
            return;
        }
        for (const w of [...watchers]) {
            if (!w.res?.writable) {
                watchers.delete(w);
                continue;
            }
            try {
                // Evaluar todas las condiciones
                const filterPassed = this.matchesFilter(enrichedChange, w.filter);
                let idPassed = true;
                if (w.ids.length > 0) {
                    const docId = enrichedChange.documentKey?._id?.toString();
                    idPassed = !!(docId && w.ids.includes(docId));
                }
                const resumePassed = !(w.lastToken && token <= w.lastToken);
                // LOG DETALLADO
                console.log(`[SSE DEBUG] Watcher evaluation:`, {
                    key,
                    operation: normalizedOperation,
                    filterPassed,
                    idPassed,
                    resumePassed,
                    willSend: filterPassed && idPassed && resumePassed,
                    watcherFilter: w.filter,
                    watcherIds: w.ids,
                    docId: enrichedChange.documentKey?._id?.toString()
                });
                if (!filterPassed)
                    continue;
                if (!idPassed)
                    continue;
                if (!resumePassed)
                    continue;
                // Enviar evento SSE
                const serialized = EJSON.stringify(enrichedChange, { relaxed: false });
                w.res.write(`event: message\n`);
                w.res.write(`data: ${serialized}\n\n`);
                if (w.res.flush)
                    w.res.flush();
                w.lastToken = token;
                console.log(`✅ [SSE] Evento ENVIADO a ${key}: ${normalizedOperation}`);
            }
            catch (err) {
                console.error(`❌ [SSE] Error enviando:`, err);
                try {
                    w.res.end();
                }
                catch { }
                w.res.writable = false;
            }
        }
    }
    /**
     * Verifica si un cambio cumple con el filtro usando sift
     */
    matchesFilter(change, filter) {
        // Sin filtro → todo pasa
        if (!filter || Object.keys(filter).length === 0) {
            console.log('[matchesFilter] Sin filtro → aceptado');
            return true;
        }
        console.log('[matchesFilter] Evaluando filtro:', JSON.stringify(filter));
        // 1. Chequeo explícito de operationType (el más común)
        if ('operationType' in filter) {
            if (change.operationType !== filter.operationType) {
                console.log(`[matchesFilter] ❌ operationType no coincide: ${change.operationType} ≠ ${filter.operationType}`);
                return false;
            }
            console.log(`[matchesFilter] ✓ operationType OK: ${filter.operationType}`);
        }
        // 2. Chequeo de campos dentro de fullDocument
        if (filter.fullDocument && typeof filter.fullDocument === 'object') {
            const doc = change.fullDocument || {};
            for (const [key, expected] of Object.entries(filter.fullDocument)) {
                const actual = doc[key];
                if (actual !== expected) {
                    console.log(`[matchesFilter] ❌ fullDocument.${key}: esperado ${expected}, recibido ${actual}`);
                    return false;
                }
                console.log(`[matchesFilter] ✓ fullDocument.${key}: ${expected}`);
            }
        }
        // 3. Si hay otros campos en la raíz, los chequeamos también
        for (const [key, expected] of Object.entries(filter)) {
            if (key === 'operationType' || key === 'fullDocument')
                continue;
            if (change[key] !== expected) {
                console.log(`[matchesFilter] ❌ ${key}: esperado ${expected}, recibido ${change[key]}`);
                return false;
            }
            console.log(`[matchesFilter] ✓ ${key}: ${expected}`);
        }
        console.log('[matchesFilter] ✓ TODAS las condiciones cumplidas → evento enviado');
        return true;
    }
    // ============================================
    // WATCH (SSE para clientes Realm)
    // ============================================
    /**
     * Implementación de watch compatible con Realm Web
     * Los clientes se suscriben vía SSE y reciben cambios en tiempo real
     */
    async watch(database, collection, args = {}, res) {
        const key = `${database}.${collection}`;
        if (!this.activeWatchers.has(key)) {
            this.activeWatchers.set(key, new Set());
        }
        const watchers = this.activeWatchers.get(key);
        // Rate limiting: máximo 500 watchers por colección
        if (watchers.size >= 500) {
            res.status(429).end('Too many watchers for this collection');
            return;
        }
        const watcher = {
            res,
            filter: args.filter || {},
            ids: args.ids || [],
            lastToken: args.resumeAfter?._data || null
        };
        watchers.add(watcher);
        // Configurar headers SSE
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
            'Access-Control-Allow-Origin': '*'
        });
        res.write(': connected\n\n');
        // Heartbeat cada 15 segundos para mantener conexión viva
        const heartbeat = setInterval(() => {
            if (res.writable)
                res.write(': hb\n\n');
        }, 15000);
        // Limpieza al cerrar la conexión
        res.once('close', () => {
            watchers.delete(watcher);
            if (watchers.size === 0)
                this.activeWatchers.delete(key);
            clearInterval(heartbeat);
        });
        return { simulated: true, message: 'Watching in standalone mode' };
    }
    // ============================================
    // OPERACIONES CRUD CON NOTIFICACIÓN
    // ============================================
    /**
     * Ejecuta cualquier operación CRUD y notifica cambios cuando corresponde
     */
    async executeOperation(operation, database, collection, ...args) {
        const client = await this.connect;
        const db = client.db(database);
        const coll = db.collection(collection);
        let result;
        let changeEvent = {
            timestamp: new Date(),
            collection,
            database,
        };
        try {
            switch (operation) {
                // ===== INSERCIONES =====
                case 'insertOne':
                    result = await coll.insertOne(args[0]);
                    changeEvent.documentKey = { _id: result.insertedId };
                    changeEvent.operation = "insert";
                    changeEvent.fullDocument = { _id: result.insertedId, ...args[0] };
                    break;
                case 'insertMany':
                    result = await coll.insertMany(args[0]);
                    changeEvent.documentKeys = result.insertedIds;
                    changeEvent.operation = "insert";
                    changeEvent.count = result.insertedCount;
                    break;
                // ===== ACTUALIZACIONES =====
                case 'updateOne':
                    result = await coll.updateOne(args[0], args[1], args[2] || {});
                    if (result.modifiedCount > 0 || result.upsertedCount > 0) {
                        changeEvent.documentKey = args[0];
                        changeEvent.updateDescription = args[1];
                        if (result.upsertedId) {
                            changeEvent.documentKey = { _id: result.upsertedId };
                        }
                        const updated = await coll.findOne(changeEvent.documentKey);
                        changeEvent.fullDocument = updated;
                        changeEvent.operation = "update";
                    }
                    break;
                case 'updateMany':
                    result = await coll.updateMany(args[0], args[1], args[2] || {});
                    if (result.modifiedCount > 0 || result.upsertedCount > 0) {
                        changeEvent.filter = args[0];
                        changeEvent.update = args[1];
                        changeEvent.count = result.modifiedCount;
                        changeEvent.operation = "update";
                    }
                    break;
                case 'replaceOne':
                    result = await coll.replaceOne(args[0], args[1], args[2] || {});
                    if (result.modifiedCount > 0 || result.upsertedCount > 0) {
                        changeEvent.documentKey = args[0];
                        changeEvent.replacement = args[1];
                        // 🔥 MEJORA: Asegurar fullDocument siempre
                        const replaced = await coll.findOne(args[0]);
                        changeEvent.fullDocument = replaced;
                        // Si fue upsert y no encontramos el documento, intentar con documentKey
                        if (result.upsertedCount > 0 && !changeEvent.fullDocument) {
                            changeEvent.fullDocument = await coll.findOne(changeEvent.documentKey);
                        }
                        changeEvent.operation = "update";
                    }
                    break;
                case 'findOneAndUpdate':
                    result = await coll.findOneAndUpdate(args[0], args[1], args[2] || {});
                    if (result.value) {
                        changeEvent.documentKey = args[0];
                        changeEvent.updateDescription = args[1];
                        changeEvent.fullDocument = result.value;
                        changeEvent.operation = "update";
                    }
                    break;
                // ===== ELIMINACIONES =====
                case 'deleteOne':
                    const toDelete = await coll.findOne(args[0]);
                    result = await coll.deleteOne(args[0]);
                    if (result.deletedCount > 0) {
                        changeEvent.documentKey = args[0];
                        changeEvent.fullDocument = toDelete;
                        changeEvent.operation = "delete";
                    }
                    break;
                case 'deleteMany':
                    result = await coll.deleteMany(args[0]);
                    if (result.deletedCount > 0) {
                        changeEvent.filter = args[0];
                        changeEvent.count = result.deletedCount;
                        changeEvent.operation = "delete";
                    }
                    break;
                // ===== OPERACIONES DE LECTURA (sin notificación) =====
                case 'find':
                case 'findOne':
                case 'aggregate':
                case 'count':
                case 'distinct':
                    return await coll[operation](...args);
                default:
                    return await coll[operation](...args);
            }
            // NOTIFICAR si la operación modificó datos
            const shouldNotify = (operation === 'insertOne' && result?.acknowledged) ||
                (operation === 'insertMany' && result?.insertedCount > 0) ||
                ((operation === 'updateOne' || operation === 'replaceOne' || operation === 'findOneAndUpdate') && (result?.modifiedCount > 0 || result?.upsertedCount > 0)) ||
                (operation === 'updateMany' && result?.modifiedCount > 0) ||
                ((operation === 'deleteOne' || operation === 'deleteMany') && result?.deletedCount > 0);
            if (shouldNotify) {
                changeEvent.data = result;
                this.notifyChange(changeEvent);
            }
            return result;
        }
        catch (error) {
            console.error(`❌ Error en ${operation}:`, error);
            throw error;
        }
    }
    // ============================================
    // MÉTODOS DE CONVENIENCIA
    // ============================================
    async insertOne(database, collection, document) {
        return this.executeOperation('insertOne', database, collection, document);
    }
    async insertMany(database, collection, documents) {
        return this.executeOperation('insertMany', database, collection, documents);
    }
    async updateOne(database, collection, filter, update, options = {}) {
        return this.executeOperation('updateOne', database, collection, filter, update, options);
    }
    async updateMany(database, collection, filter, update, options = {}) {
        return this.executeOperation('updateMany', database, collection, filter, update, options);
    }
    async deleteOne(database, collection, filter) {
        return this.executeOperation('deleteOne', database, collection, filter);
    }
    async deleteMany(database, collection, filter) {
        return this.executeOperation('deleteMany', database, collection, filter);
    }
    async replaceOne(database, collection, filter, replacement, options = {}) {
        return this.executeOperation('replaceOne', database, collection, filter, replacement, options);
    }
    async findOneAndUpdate(database, collection, filter, update, options = {}) {
        return this.executeOperation('findOneAndUpdate', database, collection, filter, update, options);
    }
    async find(database, collection, filter = {}, options = {}) {
        const client = await this.connect;
        return client.db(database).collection(collection).find(filter, options).toArray();
    }
    async findOne(database, collection, filter = {}, options = {}) {
        const client = await this.connect;
        return client.db(database).collection(collection).findOne(filter, options);
    }
    async findById(database, collection, id) {
        const client = await this.connect;
        return client.db(database).collection(collection).findOne({ _id: new mongodb_1.ObjectId(id) });
    }
    async aggregate(database, collection, pipeline) {
        const client = await this.connect;
        return client.db(database).collection(collection).aggregate(pipeline).toArray();
    }
    async count(database, collection, filter = {}) {
        const client = await this.connect;
        return client.db(database).collection(collection).countDocuments(filter);
    }
    /**
     * Cierra la conexión a MongoDB
     */
    close() {
        return this._connect?.close().catch(err => {
            console.log('Error cerrando conexión:', err);
        });
    }
};
exports.DbMongo = DbMongo;
exports.DbMongo = DbMongo = __decorate([
    (0, injector_1.Injectable)({ providedIn: "root" }),
    __metadata("design:paramtypes", [])
], DbMongo);
//# sourceMappingURL=db.mongo.js.map