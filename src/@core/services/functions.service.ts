import { EJSON } from 'bson';
import { getMongoService } from './mongo.service';

export type RealmFunction = (args: any, userId: string) => Promise<any>;

const functionsRegistry: Record<string, RealmFunction> = {};

// ============================================================================
// FUNCIÓN PRINCIPAL: find
// ============================================================================
functionsRegistry.find = async (args, userId) => {
  // args es un array con un objeto que contiene database, collection, query, etc.
  const params = Array.isArray(args) ? args[0] : args;
  const { database, collection, query, project, sort, limit, skip } = params;

  console.log(`🔍 [FUNCTION find] Ejecutando en ${database}.${collection}`);
  console.log(`   query:`, JSON.stringify(query, null, 2));

  const mongoService = getMongoService();
  const results = await mongoService.find(database, collection, {
    query: query || {},
    project,
    sort,
    limit,
    skip
  });

  // Devolver el array de documentos (ya están en formato EJSON)
  return results;
};

// ============================================================================
// FUNCIÓN: findOne
// ============================================================================
functionsRegistry.findOne = async (args, userId) => {
  const params = Array.isArray(args) ? args[0] : args;
  const { database, collection, query, project, sort } = params;

  console.log(`🔍 [FUNCTION findOne] Ejecutando en ${database}.${collection}`);
  console.log(`   query:`, JSON.stringify(query, null, 2));

  const mongoService = getMongoService();
  const result = await mongoService.findOne(database, collection, {
    query: query || {},
    project,
    sort
  });

  return result;
};

// ============================================================================
// FUNCIÓN: insertOne
// ============================================================================
functionsRegistry.insertOne = async (args, userId) => {
  const params = Array.isArray(args) ? args[0] : args;
  const { database, collection, document } = params;

  console.log(`📝 [FUNCTION insertOne] Ejecutando en ${database}.${collection}`);
  console.log(`   document:`, JSON.stringify(document, null, 2));

  const mongoService = getMongoService();
  const result = await mongoService.insertOne(database, collection, { document });

  return result;
};

// ============================================================================
// FUNCIÓN: updateOne
// ============================================================================
functionsRegistry.updateOne = async (args, userId) => {
  const params = Array.isArray(args) ? args[0] : args;
  const { database, collection, query, update, upsert, arrayFilters } = params;

  console.log(`✏️ [FUNCTION updateOne] Ejecutando en ${database}.${collection}`);
  console.log(`   query:`, JSON.stringify(query, null, 2));
  console.log(`   update:`, JSON.stringify(update, null, 2));

  const mongoService = getMongoService();
  const result = await mongoService.updateOne(database, collection, {
    query,
    update,
    upsert,
    arrayFilters
  });

  return result;
};

// ============================================================================
// FUNCIÓN: deleteOne
// ============================================================================
functionsRegistry.deleteOne = async (args, userId) => {
  const params = Array.isArray(args) ? args[0] : args;
  const { database, collection, query } = params;

  console.log(`🗑️ [FUNCTION deleteOne] Ejecutando en ${database}.${collection}`);
  console.log(`   query:`, JSON.stringify(query, null, 2));

  const mongoService = getMongoService();
  const result = await mongoService.deleteOne(database, collection, { query });

  return result;
};

// ============================================================================
// FUNCIÓN: aggregate
// ============================================================================
functionsRegistry.aggregate = async (args, userId) => {
  const params = Array.isArray(args) ? args[0] : args;
  const { database, collection, pipeline } = params;

  console.log(`📊 [FUNCTION aggregate] Ejecutando en ${database}.${collection}`);
  console.log(`   pipeline:`, JSON.stringify(pipeline, null, 2));

  const mongoService = getMongoService();
  const results = await mongoService.aggregate(database, collection, { pipeline });

  return results;
};

// ============================================================================
// FUNCIÓN: count
// ============================================================================
functionsRegistry.count = async (args, userId) => {
  const params = Array.isArray(args) ? args[0] : args;
  const { database, collection, query, limit } = params;

  console.log(`🔢 [FUNCTION count] Ejecutando en ${database}.${collection}`);
  console.log(`   query:`, JSON.stringify(query, null, 2));

  const mongoService = getMongoService();
  const count = await mongoService.count(database, collection, { query, limit });

  return count;
};

// ============================================================================
// FUNCIONES DE EJEMPLO ADICIONALES
// ============================================================================

// Ejemplo: getActiveRoles
functionsRegistry.getActiveRoles = async (args, userId) => {
  const mongoService = getMongoService();
  const database = args.database || 'samuelV1';
  const collection = args.collection || 'roles';

  const roles = await mongoService.find(database, collection, {
    query: { active: true }
  });
  return roles;
};

// Ejemplo: createPatient
functionsRegistry.createPatient = async (args, userId) => {
  const mongoService = getMongoService();
  const database = args.database || 'samuelV1';
  const collection = args.collection || 'patients';

  const result = await mongoService.insertOne(database, collection, {
    document: {
      name: args.name,
      age: args.age,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });
  return { insertedId: result.insertedId, success: true };
};

// Ejemplo: getCurrentUserProfile
functionsRegistry.getCurrentUserProfile = async (args, userId) => {
  // Aquí podrías consultar la colección de usuarios con el userId
  return { userId, name: 'Usuario', email: 'user@example.com' };
};

// ============================================================================
// FUNCIONES DE REGISTRO
// ============================================================================

export function registerFunction(name: string, fn: RealmFunction): void {
  if (functionsRegistry[name]) {
    console.warn(`⚠️ [FUNCTIONS] La función '${name}' ya está registrada. Se sobreescribirá.`);
  }
  functionsRegistry[name] = fn;
}

export function getFunction(name: string): RealmFunction | undefined {
  return functionsRegistry[name];
}

export function listFunctions(): string[] {
  return Object.keys(functionsRegistry);
}
