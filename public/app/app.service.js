"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const mongo_routes_1 = __importDefault(require("./routes/mongo.routes"));
const errors_1 = require("@core/errors");
const app = (0, express_1.default)();
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
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        // Permitir peticiones sin origen (Postman, curl, etc.)
        if (!origin) {
            return callback(null, true);
        }
        // Verificar si el origen está permitido
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            console.log(`❌ CORS bloqueado para: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
// Manejar explícitamente las peticiones OPTIONS (preflight)
app.options('*', (0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// ============================================================================
// RUTAS
// ============================================================================
app.use(auth_routes_1.default);
app.use(mongo_routes_1.default);
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
app.use(errors_1.errorConverter);
app.use(errors_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.service.js.map