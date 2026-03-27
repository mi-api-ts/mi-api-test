import { Filter, FindOptions } from "mongodb";

export type IoSchema = | "company" | "role" | "authorizes" | "group" | "servcat" | "submed" | "subrsts" | "phone" | "patient" | "service" | "movord" | "file"

export interface ApiDb<T> {

    findOneAndUpdate: (_filter: Filter<any>, _update: T, options?: FindOptions, _schema?: IoSchema[]) => Promise<any>;
    updateMany: (_filter: Filter<any>, _update: T, options?: FindOptions, _schema?: IoSchema[]) => Promise<any>;
    insertMany: (_documents: T[]) => Promise<any>;
    deleteMany: (_filter: Filter<any>) => Promise<any>;
    aggregate: (_pipeline: any[]) => Promise<any[]>;
    find: (_filter?: Filter<any>, _options?: FindOptions, _schema?: IoSchema[]) => Promise<T[]>;
    findOne: (_filter?: Filter<any>, _options?: FindOptions, _schema?: IoSchema[]) => Promise<T>;
    deleteOne: (_filter?: Filter<any>) => Promise<T>
    insertOne: (_document: T) => Promise<T>
}

export interface IoJurisprudencia {

}

export interface IoTag {
    id?: string;
    title?: string;

    indiceId?: string;
    children?: string[];
    parentId?: string;

}

export interface IoFile {
    id?: string;
    data?: any;
    colection?: string;
    type?: string;
    contentType?: string;
    extension?: string;

}

export interface IoFicha {
    id?: string;
    data?: any
    parentTagId?: string;
    tagId?: string;
    parentId?: string;
    numero?: string;
    resolution?: string;
    completed?: boolean;

}


export interface IoConetnido {
    id_contenido?: string;
    contenido?: any
    contenido_original?: string;
    orden_anterior?: string;
    modificado?: string;
    afectado_modificacion?: string;
    fid_estado?: string;
    fid_tipo_contenido?: boolean;
    fid_documento?: string;
}

export interface IoContenidos {
    id_contenido: number,
    contenido: string,
    contenido_original: string;
    descripcion: null,
    id_contenido_superior: any,
    "id_contenido_madre": any,
    "orden": number,
    "actual": boolean,
    "mensaje_confirmacion": null,
    "fecha_hito": null,
    "fecha_autoguardado": string,
    "orden_anterior": number,
    "modificado": number,
    "afectado_modificacion": number,
    "_usuario_creacion": number,
    "_usuario_modificacion": number,
    "_fecha_creacion": string,
    "_fecha_modificacion": string,
    "fid_estado": number,
    "fid_tipo_contenido": number,
    "fid_documento": number


}

export interface IoCTipo {
    id: string;
    id_tipo_contenido: number,
    tipo_contenido: string,
    id_tipo_contenido_superior: number,
    _fecha_creacion: string
    _fecha_modificacion: string


}



export interface IoDocumento {
    id?: string;
    id_documento?: string;
    "titulo"?: string;
    "titulo_documento"?: string;
    "numero_ley"?: number,
    "estado_temp"?: number,
    "fecha_promulgacion"?: string;
    "numero_gaceta"?: number,
    "pagina_inicial"?: number,
    "pagina_final"?: number,
    "autoridad"?: string;

}

export interface IoDTipo {
    id?: string;
    name?: string;
}

export interface IoLabel {
    id?: string;

    title?: string;



}

export interface IoJrsp {
    id?: string;
    fichaId?: number,
    resolucion?: string,
    categoria?: string,
    tipo?: string,
    contenido?: any,
    completed?: boolean;
    tagId?: string;
    parentTagId?: string;
    data?: any
}
export interface IoToken {
    id?: string;
    token?: string;
    user?: string;
    expires?: any;
    sub?: string;
    iat?: number;
    exp?: number;
    type?: string;
    tokenTypes?: string;
    blacklisted?: boolean;
}

export interface IoJrpArbol {
    indiceId: string;
    numero?: string[];
    labelId?: string;


}

export interface IoUser {
    id?: string;
    email?: string;
    name?: string;
    password?: string;
    companyId?: string;
    roleId?: string;
    company?: IoCompany | string;
    client?: string;
    isEmailVerified?: boolean;
    role?: IoRole;



}

export interface IoRole {
    id?: string;
    rolnom?: string;
    companyId?: string;
    statu?: boolean;


}

export interface IoCompany {
    id?: string;
    name?: string;
    statu?: boolean;
    client?: string;

}


export interface IoAuthorize {
    id?: string;



}

export interface IoLanguage {
    id?: string;
    name?: string;
    label?: string;

}


export interface AiAprendizaje {
    id?: string;
    label: string; input: string; aiId: string; index: number

}

export interface AiMachine {
    id?: string;
    aiId?: string;
    label?: string[];
    author?: string;
    link?: string;
    type?: "aprendizaje"|"classifier",
    nivel?: number,
    materia?: "penal" | "laboral" | "todo",
    raw?: any;
    output?: string;
    input?:string;

}

export interface AiTmp {
    id?: string;
    contactId?: string;
    route?: string[];
    plugin?: string;
    chatId?: string;
    data?: any;
    raw?: any

}

export interface IoCTipo {
    id:string;
    id_tipo_contenido: number,
    tipo_contenido:string,
    id_tipo_contenido_superior: number,
    _fecha_creacion: string
    _fecha_modificacion: string
}


export interface AiPatient {
    id:string;

}


export interface IDecodeToken {
    id: string;
    roleId: string;
    companyId: string;
    role: string;
    usrename: string;
    language: any;
    whatsappId:string;
  }
  
