import { Request, Response } from 'express';
import { RespuestaAPI, Filtros, Voto } from '../types';

// Datos de ejemplo (simulando base de datos)
const datosEjemplo: Voto[] = [
    { acta_id: "601170-7", mesa: 6, municipio: "Yacuiba", localidad: "Yacuiba Urbano", partido: "AIR", votos: 31 },
    { acta_id: "601170-7", mesa: 6, municipio: "Yacuiba", localidad: "Yacuiba Urbano", partido: "PATRIA", votos: 21 },
    { acta_id: "601170-7", mesa: 6, municipio: "Yacuiba", localidad: "Yacuiba Urbano", partido: "PDC", votos: 7 },
    { acta_id: "601282-9", mesa: 2, municipio: "Yacuiba", localidad: "Yacuiba Urbano", partido: "ISA", votos: 13 },
    { acta_id: "601282-9", mesa: 2, municipio: "Yacuiba", localidad: "Yacuiba Urbano", partido: "PATRIA", votos: 8 },
    { acta_id: "601282-8", mesa: 1, municipio: "Yacuiba", localidad: "Yacuiba Urbano", partido: "AIR", votos: 70 },
    { acta_id: "601282-8", mesa: 1, municipio: "Yacuiba", localidad: "Yacuiba Urbano", partido: "PATRIA", votos: 40 },
];

export class DatosController {
    
    // Obtener todos los datos
    static getDatos(req: Request, res: Response): void {
        const respuesta: RespuestaAPI = {
            success: true,
            message: "Datos obtenidos correctamente",
            data: datosEjemplo,
            timestamp: new Date().toISOString()
        };
        res.json(respuesta);
    }

    // Obtener municipios únicos
    static getMunicipios(req: Request, res: Response): void {
        const municipios = [...new Set(datosEjemplo.map(d => d.municipio))];
        const respuesta: RespuestaAPI = {
            success: true,
            message: "Municipios obtenidos",
            data: municipios,
            timestamp: new Date().toISOString()
        };
        res.json(respuesta);
    }

    // Obtener localidades por municipio
    static getLocalidades(req: Request, res: Response): void {
        const { municipio } = req.params;
        const localidades = [...new Set(
            datosEjemplo
                .filter(d => d.municipio === municipio)
                .map(d => d.localidad)
        )];
        
        const respuesta: RespuestaAPI = {
            success: true,
            message: `Localidades para ${municipio}`,
            data: localidades,
            timestamp: new Date().toISOString()
        };
        res.json(respuesta);
    }

    // Obtener resultados filtrados
    static getResultados(req: Request, res: Response): void {
        const filtros: Filtros = req.query;
        
        let resultados = [...datosEjemplo];
        
        if (filtros.municipio) {
            resultados = resultados.filter(d => d.municipio === filtros.municipio);
        }
        if (filtros.localidad) {
            resultados = resultados.filter(d => d.localidad === filtros.localidad);
        }
        if (filtros.mesa) {
            resultados = resultados.filter(d => d.mesa === filtros.mesa);
        }
        
        // Agrupar por partido
        const agrupado = resultados.reduce((acc, curr) => {
            acc[curr.partido] = (acc[curr.partido] || 0) + curr.votos;
            return acc;
        }, {} as Record<string, number>);
        
        const respuesta: RespuestaAPI &{metadata:any} = {
            success: true,
            message: "Resultados filtrados",
            data: agrupado,
            metadata: {
                filtros_aplicados: filtros,
                total_votos: Object.values(agrupado).reduce((a, b) => a + b, 0)
            },
            timestamp: new Date().toISOString()
        };
        res.json(respuesta);
    }

    // Endpoint de salud (health check)
    static health(req: Request, res: Response): void {
        const respuesta: RespuestaAPI = {
            success: true,
            message: "API funcionando correctamente",
            data: {
                status: "healthy",
                uptime: process.uptime(),
                version: "1.0.0"
            },
            timestamp: new Date().toISOString()
        };
        res.json(respuesta);
    }
}