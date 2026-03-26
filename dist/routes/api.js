"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const datosController_1 = require("../controllers/datosController");
const router = (0, express_1.Router)();
// Endpoints públicos
router.get('/health', datosController_1.DatosController.health);
router.get('/datos', datosController_1.DatosController.getDatos);
router.get('/municipios', datosController_1.DatosController.getMunicipios);
router.get('/localidades/:municipio', datosController_1.DatosController.getLocalidades);
router.get('/resultados', datosController_1.DatosController.getResultados);
exports.default = router;
//# sourceMappingURL=api.js.map