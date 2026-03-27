import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import mongoRoutes from './routes/mongo.routes';
import { notFoundHandler } from '@core/error.middleware';
import { errorConverter, errorHandler } from '@core/errors';

const app = express();

// ============================================================================
// MIDDLEWARE DE LOG GLOBAL
// ============================================================================

app.use((req, res, next) => {
  console.log(`\n🌐 [HTTP] ${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ============================================================================
// MIDDLEWARES GLOBALES
// ============================================================================

// Configuración CORS corregida
const allowedOrigins = [
  'http://localhost:4200',
  'http://127.0.0.1:4200',
  'https://mi-api-test-1.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir peticiones sin origen (Postman, curl, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // Verificar si el origen está permitido
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`❌ CORS bloqueado para: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Manejar explícitamente las peticiones OPTIONS (preflight)
app.options('*', cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================================
// RUTAS
// ============================================================================

app.use(authRoutes);
app.use(mongoRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ============================================================================
// MANEJO DE ERRORES
// ============================================================================

//app.use(notFoundHandler);
app.use(errorConverter);
app.use(errorHandler);

export default app;