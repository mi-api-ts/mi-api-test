import { Router } from 'express';
import { DatosController } from '../controllers/datosController';

const router = Router();

// Endpoints públicos
router.get('/health', DatosController.health);
router.get('/datos', DatosController.getDatos);
router.get('/municipios', DatosController.getMunicipios);
router.get('/localidades/:municipio', DatosController.getLocalidades);
router.get('/resultados', DatosController.getResultados);

export default router;