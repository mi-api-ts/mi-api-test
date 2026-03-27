import { 
    MongoClient, 
    Db, 
    Collection, 
    MongoClientOptions,
    ObjectId,
    Filter,
    UpdateFilter,
    Document as MongoDocument,
    OptionalUnlessRequiredId,
    InsertOneResult,
    UpdateResult,
    DeleteResult,
    FindOptions,
    Sort as MongoSort,
    WithId,
    ModifyResult,
    FindCursor
} from 'mongodb';

import { Injectable } from '@om/inyects/injector';
import { BaseModel, FindOneAndUpdateOptions, QueryOptions, UpdateOptions } from './models';

@Injectable({ providedIn: "root" })
export class MongoDBRepository<T extends BaseModel> {
    private collectionName: string = '';
    private client: MongoClient | null = null;
    private db: Db | null = null;
    private isConnected: boolean = false;

    constructor() { }

    /**
     * Conectar a la base de datos MongoDB
     */
    public async connectDB(uri: string, dbName: string, options?: MongoClientOptions): Promise<void> {
        try {
            this.client = await MongoClient.connect(uri, options || {});
            this.db = this.client.db(dbName);
            this.isConnected = true;
            console.log(`✅ Conectado a MongoDB: ${dbName}`);
        } catch (error) {
            console.error('❌ Error conectando a MongoDB:', error);
            this.isConnected = false;
            throw error;
        }
    }

    /**
     * Especificar la colección a utilizar
     */
    public connectCollection(collectionName: string): void {
        this.collectionName = collectionName;
    }

    /**
     * Verificar si está conectado a la base de datos
     */
    public isDBConnected(): boolean {
        return this.isConnected;
    }

    /**
     * Obtener la colección actual
     */
    private async getCollection(): Promise<Collection<T>> {
        if (!this.db || !this.isConnected) {
            throw new Error('Base de datos no conectada');
        }

        if (!this.collectionName) {
            throw new Error('Nombre de colección no especificado');
        }

        return this.db.collection<T>(this.collectionName);
    }

    /**
     * Desconectar de la base de datos
     */
    public async disconnect(): Promise<void> {
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
    public async create(data: Partial<T>): Promise<T> {
        try {
            const collection = await this.getCollection();
            
            const document: OptionalUnlessRequiredId<T> = {
                ...data,
                createdAt: data.createdAt || new Date(),
                updatedAt: new Date()
            } as OptionalUnlessRequiredId<T>;

            const result = await collection.insertOne(document);
            
            const createdDoc: T = {
                ...document as T,
                _id: result.insertedId
            };
            
            return createdDoc;
        } catch (error) {
            console.error('Error en create:', error);
            throw error;
        }
    }

    /**
     * CREATE - Crear múltiples documentos
     */
    public async createMany(data: Partial<T>[]): Promise<T[]> {
        try {
            const collection = await this.getCollection();
            
            const documents: OptionalUnlessRequiredId<T>[] = data.map(doc => ({
                ...doc,
                createdAt: doc.createdAt || new Date(),
                updatedAt: new Date()
            } as OptionalUnlessRequiredId<T>));

            const result = await collection.insertMany(documents);
            
            // Asignar los IDs generados a cada documento
            const createdDocs: T[] = documents.map((doc, index) => ({
                ...doc as T,
                _id: result.insertedIds[index]
            }));
            
            return createdDocs;
        } catch (error) {
            console.error('Error en createMany:', error);
            throw error;
        }
    }

    /**
     * READ - Encontrar un documento por filtro
     */
    public async findOne(filter: Filter<T>, options?: QueryOptions<T>): Promise<T | null> {
        try {
            const collection = await this.getCollection();
            const findOptions: FindOptions = {};

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
        } catch (error) {
            console.error('Error en findOne:', error);
            throw error;
        }
    }

    /**
     * READ - Encontrar documento por ID
     */
    public async findById(id: string | ObjectId): Promise<T | null> {
        try {
            const objectId = typeof id === 'string' ? new ObjectId(id) : id;
            return await this.findOne({ _id: objectId } as Filter<T>);
        } catch (error) {
            console.error('Error en findById:', error);
            throw error;
        }
    }

    /**
     * READ - Encontrar múltiples documentos
     */
    public async find(filter: Filter<T> = {}, options?: QueryOptions<T>): Promise<T[]> {
        try {
            const collection = await this.getCollection();
            const findOptions: FindOptions = {};

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
            
            return docs.map(doc => this.convertToModel(doc)!);
        } catch (error) {
            console.error('Error en find:', error);
            throw error;
        }
    }

    /**
     * UPDATE - Actualizar un documento
     */
    public async updateOne(
        filter: Filter<T>,
        update: UpdateFilter<T> | Partial<T>,
        options: UpdateOptions = {}
    ): Promise<boolean> {
        try {
            const collection = await this.getCollection();
            
            // Preparar el documento de actualización
            const updateDoc: UpdateFilter<T> = {
                $set: {
                    ...(update as Partial<T>),
                    updatedAt: new Date()
                }
            };

            const result = await collection.updateOne(filter, updateDoc, {
                upsert: options.upsert || false
            });

            return result.modifiedCount > 0 || result.upsertedCount > 0;
        } catch (error) {
            console.error('Error en updateOne:', error);
            throw error;
        }
    }

    /**
     * UPDATE - Actualizar múltiples documentos
     */
    public async updateMany(
        filter: Filter<T>,
        update: UpdateFilter<T> | Partial<T>,
        options: UpdateOptions = {}
    ): Promise<number> {
        try {
            const collection = await this.getCollection();
            
            const updateDoc: UpdateFilter<T> = {
                $set: {
                    ...(update as Partial<T>),
                    updatedAt: new Date()
                }
            };

            const result = await collection.updateMany(filter, updateDoc, {
                upsert: options.upsert || false
            });

            return result.modifiedCount;
        } catch (error) {
            console.error('Error en updateMany:', error);
            throw error;
        }
    }

    /**
     * UPDATE - Encontrar y actualizar un documento
     */
    public async findOneAndUpdate(
        filter: Filter<T>,
        update: UpdateFilter<T> | Partial<T>,
        options: FindOneAndUpdateOptions = {}
    ): Promise<T | null> {
        try {
            const collection = await this.getCollection();
            
            const updateDoc: UpdateFilter<T> = {
                $set: {
                    ...(update as Partial<T>),
                    updatedAt: new Date()
                }
            };

            const result = await collection.findOneAndUpdate(
                filter,
                updateDoc,
                {
                    returnDocument: options.returnOriginal ? 'before' : 'after',
                    upsert: options.upsert || false,
                    includeResultMetadata: true
                }
            );

            if (!result || !result.value) {
                return null;
            }

            return this.convertToModel(result.value);
        } catch (error) {
            console.error('Error en findOneAndUpdate:', error);
            throw error;
        }
    }

    /**
     * DELETE - Eliminar un documento
     */
    public async deleteOne(filter: Filter<T>): Promise<boolean> {
        try {
            const collection = await this.getCollection();
            const result = await collection.deleteOne(filter);
            return result.deletedCount > 0;
        } catch (error) {
            console.error('Error en deleteOne:', error);
            throw error;
        }
    }

    /**
     * DELETE - Eliminar por ID
     */
    public async deleteById(id: string | ObjectId): Promise<boolean> {
        try {
            const objectId = typeof id === 'string' ? new ObjectId(id) : id;
            return await this.deleteOne({ _id: objectId } as Filter<T>);
        } catch (error) {
            console.error('Error en deleteById:', error);
            throw error;
        }
    }

    /**
     * DELETE - Eliminar múltiples documentos
     */
    public async deleteMany(filter: Filter<T>): Promise<number> {
        try {
            const collection = await this.getCollection();
            const result = await collection.deleteMany(filter);
            return result.deletedCount;
        } catch (error) {
            console.error('Error en deleteMany:', error);
            throw error;
        }
    }

    // ============ MÉTODOS DE CONSULTA ============

    /**
     * COUNT - Contar documentos
     */
    public async count(filter: Filter<T> = {}): Promise<number> {
        try {
            const collection = await this.getCollection();
            return await collection.countDocuments(filter);
        } catch (error) {
            console.error('Error en count:', error);
            throw error;
        }
    }

    /**
     * EXISTS - Verificar si existe un documento
     */
    public async exists(filter: Filter<T>): Promise<boolean> {
        try {
            const collection = await this.getCollection();
            const doc = await collection.findOne(filter, { projection: { _id: 1 } });
            return !!doc;
        } catch (error) {
            console.error('Error en exists:', error);
            throw error;
        }
    }

    /**
     * AGGREGATE - Ejecutar pipeline de agregación
     */
    public async aggregate(pipeline: any[]): Promise<any[]> {
        try {
            const collection = await this.getCollection();
            return await collection.aggregate(pipeline).toArray();
        } catch (error) {
            console.error('Error en aggregate:', error);
            throw error;
        }
    }

    // ============ MÉTODOS HELPER ============

    /**
     * Convertir documento MongoDB a modelo
     */
    private convertToModel(doc: WithId<T> | null): T | null {
        if (!doc) return null;
        return doc as T;
    }

    /**
     * Parsear proyección (select)
     */
    private parseProjection(select: MongoDocument | string): MongoDocument {
        if (typeof select === 'string') {
            const fields = select.split(' ').filter(f => f.trim());
            const projection: MongoDocument = {};
            
            fields.forEach(field => {
                const trimmed = field.trim();
                if (trimmed.startsWith('-')) {
                    projection[trimmed.substring(1)] = 0;
                } else {
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
    private parseSort(sort: MongoSort | string): MongoSort {
        if (typeof sort === 'string') {
            const fields = sort.split(' ').filter(f => f.trim());
            const sortObj: MongoSort = {};
            
            fields.forEach(field => {
                const trimmed = field.trim();
                if (trimmed.startsWith('-')) {
                    sortObj[trimmed.substring(1)] = -1;
                } else {
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
    public getDatabase(): Db | null {
        return this.db;
    }

    /**
     * Obtener nombre de la colección
     */
    public getCollectionName(): string {
        return this.collectionName;
    }

    /**
     * Verificar conexión con ping
     */
    public async ping(): Promise<boolean> {
        if (!this.db || !this.isConnected) {
            return false;
        }
        
        try {
            await this.db.command({ ping: 1 });
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Crear índice
     */
    public async createIndex(keys: any, options?: any): Promise<string> {
        try {
            const collection = await this.getCollection();
            return await collection.createIndex(keys, options);
        } catch (error) {
            console.error('Error creando índice:', error);
            throw error;
        }
    }

    /**
     * Obtener índices
     */
    public async listIndexes(): Promise<any[]> {
        try {
            const collection = await this.getCollection();
            return await collection.indexes();
        } catch (error) {
            console.error('Error listando índices:', error);
            throw error;
        }
    }

    /**
     * Transacción (ejemplo básico)
     */
    public async withTransaction<TResult>(
        operation: (session: any) => Promise<TResult>
    ): Promise<TResult> {
        if (!this.client) {
            throw new Error('Cliente MongoDB no disponible');
        }

        const session = this.client.startSession();
        
        try {
            let result: TResult;
            
            await session.withTransaction(async () => {
                result = await operation(session);
            });
            
            return result!;
        } finally {
            await session.endSession();
        }
    }
}