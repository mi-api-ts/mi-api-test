// Registrar module-alias PRIMERO (debe ser lo primero)



import dotenv from 'dotenv';
dotenv.config();

import 'reflect-metadata';
const captureOnv =String().concat(process.env.NODE_ENV).trim()

console.log('NODE_ENV:', captureOnv==="production",captureOnv);

if (captureOnv==="production") {
    require('module-alias/register');
  }

  


// Importaciones usando alias
import app from 'app/app.service';
import { logger } from '@core/logger';
import { env } from '@core/config/envConfig';


try {
    const PORT = process.env.PORT || 5000;
    let server: any;

        //  const service = SocketsService.instance;
        server = app.listen(PORT, async () => {
            // service.mongoClient = conection;
            logger.info(`Listening to port ${PORT}`);


        });


    const exitHandler = () => {
        if (server) {
            server.close(() => {
                logger.info('Server closed');
                process.exit(1);
            });
        } else {
            process.exit(1);
        }
    };

    const unexpectedErrorHandler = (error: string) => {
        logger.error(error);
        exitHandler();
    };

    //process.on('uncaughtException', unexpectedErrorHandler);
    //process.on('unhandledRejection', unexpectedErrorHandler);

    process.on('SIGTERM', () => {
        logger.info('SIGTERM received');
        if (server) {
            server.close();
        }
    });
    
} catch (error) {
    console.log(error)
}

