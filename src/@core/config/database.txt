import { MongoClient, Db, Collection } from 'mongodb';

let clientInstance: MongoClient | null = null;
let dbCache: Map<string, Db> = new Map();

export async function getMongoClient(): Promise<MongoClient> {
  if (clientInstance) return clientInstance;
  const uri = process.env.MONGODB_URI || 'mongodb+srv://albertocoronado2025_db_user:5056339@cluster0.vzc1nb8.mongodb.net/?appName=Cluster0';
 
  clientInstance = new MongoClient(uri);
  await clientInstance.connect();
  console.log(`✅ [DB] Conexión establecida`);
  return clientInstance;
}

export async function getDatabase(dbName: string): Promise<Db> {
  if (dbCache.has(dbName)) return dbCache.get(dbName)!;
  const client = await getMongoClient();
  const db = client.db(dbName);
  dbCache.set(dbName, db);
  console.log(`📚 [DB] Base de datos seleccionada: ${dbName}`);
  return db;
}

export async function getCollection(dbName: string, collectionName: string): Promise<Collection> {
  const db = await getDatabase(dbName);
  return db.collection(collectionName);
}

export async function closeDatabaseConnection(): Promise<void> {
  if (clientInstance) {
    await clientInstance.close();
    clientInstance = null;
    dbCache.clear();
    console.log('🔌 [DB] Conexión a MongoDB cerrada');
  }
}
