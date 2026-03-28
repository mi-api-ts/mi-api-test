"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMongoClient = getMongoClient;
exports.getDatabase = getDatabase;
exports.getCollection = getCollection;
exports.closeDatabaseConnection = closeDatabaseConnection;
const mongodb_1 = require("mongodb");
let clientInstance = null;
let dbCache = new Map();
async function getMongoClient() {
    if (clientInstance)
        return clientInstance;
    const uri = process.env.MONGODB_URI || 'mongodb+srv://albertocoronado2025_db_user:5056339@cluster0.vzc1nb8.mongodb.net/?appName=Cluster0';
    clientInstance = new mongodb_1.MongoClient(uri);
    await clientInstance.connect();
    console.log(`✅ [DB] Conexión establecida`);
    return clientInstance;
}
async function getDatabase(dbName) {
    if (dbCache.has(dbName))
        return dbCache.get(dbName);
    const client = await getMongoClient();
    const db = client.db(dbName);
    dbCache.set(dbName, db);
    console.log(`📚 [DB] Base de datos seleccionada: ${dbName}`);
    return db;
}
async function getCollection(dbName, collectionName) {
    const db = await getDatabase(dbName);
    return db.collection(collectionName);
}
async function closeDatabaseConnection() {
    if (clientInstance) {
        await clientInstance.close();
        clientInstance = null;
        dbCache.clear();
        console.log('🔌 [DB] Conexión a MongoDB cerrada');
    }
}
//# sourceMappingURL=database.js.map