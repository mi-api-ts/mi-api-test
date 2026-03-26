"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatosController = void 0;
// Datos de ejemplo (simulando base de datos)
const datosEjemplo = [
    { acta_id: "601170-7", mesa: 6, municipio: "Yacuiba", localidad: "Yacuiba Urbano", partido: "AIR", votos: 31 },
    { acta_id: "601170-7", mesa: 6, municipio: "Yacuiba", localidad: "Yacuiba Urbano", partido: "PATRIA", votos: 21 },
    { acta_id: "601170-7", mesa: 6, municipio: "Yacuiba", localidad: "Yacuiba Urbano", partido: "PDC", votos: 7 },
    { acta_id: "601282-9", mesa: 2, municipio: "Yacuiba", localidad: "Yacuiba Urbano", partido: "ISA", votos: 13 },
    { acta_id: "601282-9", mesa: 2, municipio: "Yacuiba", localidad: "Yacuiba Urbano", partido: "PATRIA", votos: 8 },
    { acta_id: "601282-8", mesa: 1, municipio: "Yacuiba", localidad: "Yacuiba Urbano", partido: "AIR", votos: 70 },
    { acta_id: "601282-8", mesa: 1, municipio: "Yacuiba", localidad: "Yacuiba Urbano", partido: "PATRIA", votos: 40 },
];
class DatosController {
    // Obtener todos los datos
    static getDatos(req, res) {
        const respuesta = {
            success: true,
            message: "Datos obtenidos correctamente",
            data: datosEjemplo,
            timestamp: new Date().toISOString()
        };
        res.json(respuesta);
    }
    // Obtener municipios únicos
    static getMunicipios(req, res) {
        const municipios = [...new Set(datosEjemplo.map(d => d.municipio))];
        const respuesta = {
            success: true,
            message: "Municipios obtenidos",
            data: municipios,
            timestamp: new Date().toISOString()
        };
        res.json(respuesta);
    }
    // Obtener localidades por municipio
    static getLocalidades(req, res) {
        const { municipio } = req.params;
        const localidades = [...new Set(datosEjemplo
                .filter(d => d.municipio === municipio)
                .map(d => d.localidad))];
        const respuesta = {
            success: true,
            message: `Localidades para ${municipio}`,
            data: localidades,
            timestamp: new Date().toISOString()
        };
        res.json(respuesta);
    }
    // Obtener resultados filtrados
    static getResultados(req, res) {
        const filtros = req.query;
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
        }, {});
        const respuesta = {
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
    static health(req, res) {
        const respuesta = {
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
exports.DatosController = DatosController;
//# sourceMappingURL=datosController.js.map