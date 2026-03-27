"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Registrar module-alias PRIMERO (debe ser lo primero)
//import 'module-alias/register';
require("reflect-metadata");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Importaciones usando alias
const app_service_1 = __importDefault(require("app/app.service"));
const logger_1 = require("@core/logger");
try {
    const PORT = process.env.PORT || 5000;
    let server;
    //  const service = SocketsService.instance;
    server = app_service_1.default.listen(PORT, async () => {
        // service.mongoClient = conection;
        logger_1.logger.info(`Listening to port ${PORT}`);
    });
    const exitHandler = () => {
        if (server) {
            server.close(() => {
                logger_1.logger.info('Server closed');
                process.exit(1);
            });
        }
        else {
            process.exit(1);
        }
    };
    const unexpectedErrorHandler = (error) => {
        logger_1.logger.error(error);
        exitHandler();
    };
    //process.on('uncaughtException', unexpectedErrorHandler);
    //process.on('unhandledRejection', unexpectedErrorHandler);
    process.on('SIGTERM', () => {
        logger_1.logger.info('SIGTERM received');
        if (server) {
            server.close();
        }
    });
}
catch (error) {
    console.log(error);
}
