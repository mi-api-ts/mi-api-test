import { Collection } from 'mongodb';

// ============================================================================
// OPERACIONES DE CONSULTA
// ============================================================================

export interface FindRequest {
  query?: Record<string, any>;
  project?: Record<string, any>;
  sort?: Record<string, any>;
  limit?: number;
  skip?: number;          // ✅ añadido
  collation?: Collection;  // ✅ añadido
  maxTimeMS?: number;     // ✅ añadido
}

export interface FindOneRequest {
  query?: Record<string, any>;
  project?: Record<string, any>;
  sort?: Record<string, any>;
  skip?: number;          // ✅ añadido
  collation?: Collection;  // ✅ añadido
}

// ============================================================================
// OPERACIONES DE INSERCIÓN
// ============================================================================

export interface InsertOneRequest {
  document: Record<string, any>;
}

export interface InsertManyRequest {
  documents: Record<string, any>[];
}

// ============================================================================
// OPERACIONES DE ACTUALIZACIÓN
// ============================================================================

export interface UpdateRequest {
  query: Record<string, any>;
  update: Record<string, any>;
  upsert?: boolean;
  arrayFilters?: any[];
  collation?: Collection;   // ✅ añadido
}

export interface ReplaceOneRequest {
  query: Record<string, any>;
  replacement: Record<string, any>;
  upsert?: boolean;
}

// ============================================================================
// OPERACIONES DE ELIMINACIÓN
// ============================================================================

export interface DeleteRequest {
  query: Record<string, any>;
}

// ============================================================================
// OPERACIONES DE AGREGACIÓN
// ============================================================================

export interface AggregateRequest {
  pipeline: Record<string, any>[];
}

// ============================================================================
// OPERACIONES FIND ONE AND MODIFY
// ============================================================================

export interface FindOneAndUpdateRequest {
  query: Record<string, any>;
  update: Record<string, any>;
  upsert?: boolean;
  returnNewDocument?: boolean;
  sort?: Record<string, any>;
  projection?: Record<string, any>;
}

export interface FindOneAndReplaceRequest {
  query: Record<string, any>;
  replacement: Record<string, any>;
  upsert?: boolean;
  returnNewDocument?: boolean;
  sort?: Record<string, any>;
  projection?: Record<string, any>;
}

export interface FindOneAndDeleteRequest {
  query: Record<string, any>;
  sort?: Record<string, any>;
  projection?: Record<string, any>;
}

// ============================================================================
// OPERACIÓN COUNT
// ============================================================================

export interface CountRequest {
  query?: Record<string, any>;
  limit?: number;
}

// ============================================================================
// RESPUESTAS
// ============================================================================

export interface InsertOneResponse {
  insertedId: string;
}

export interface InsertManyResponse {
  insertedIds: string[];
}

export interface UpdateResponse {
  matchedCount: number;
  modifiedCount: number;
  upsertedId?: string;
}

export interface DeleteResponse {
  deletedCount: number;
}
