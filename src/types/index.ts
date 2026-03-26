export interface RespuestaAPI {
    success: boolean;
    message: string;
    data?: any;
    timestamp: string;
}

export interface Voto {
    acta_id: string;
    mesa: number;
    municipio: string;
    localidad: string;
    partido: string;
    votos: number;
}

export interface Filtros {
    municipio?: string;
    localidad?: string;
    recinto?: string;
    mesa?: number;
}