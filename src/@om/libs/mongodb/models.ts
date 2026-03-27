import { Document } from "mongodb";

// interfaces/models.ts - ACTUALIZADO
export interface BaseModel {
    _id?: any;
    createdAt?: Date;
    updatedAt?: Date;
}

// Actualizado para usar tipos más específicos
export interface QueryOptions<T> {
    where?: Partial<T>;
    select?: Document | string;  // Cambiado de string | object a Document | string
    sort?: Sort | string;        // Cambiado de string | object a Sort | string
    skip?: number;
    limit?: number;
    populate?: string | Array<{ path: string; select?: string }>;
}

export interface FindOneAndUpdateOptions {
    returnOriginal?: boolean;
    upsert?: boolean;
    includeResultMetadata?: boolean;
}

export interface UpdateOptions {
    new?: boolean;
    upsert?: boolean;
    runValidators?: boolean;
    returnOriginal?: boolean; // Añadido para findOneAndUpdate
}

// Tipo helper para Sort
export type SortDirection = 1 | -1 | 'asc' | 'desc' | 'ascending' | 'descending';
export type Sort = { [key: string]: SortDirection };