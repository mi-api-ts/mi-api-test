/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status-codes';
import { logger } from '../logger';


import { ApiError } from '.';
import { env } from '@core/config/envConfig';




export const errorConverter = (err: any, _req: Request, _res: Response, next: NextFunction) => {
  let error = err;
 
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode ||  httpStatus.INTERNAL_SERVER_ERROR;
    const message: string = error.message || `${httpStatus[statusCode]}`;
    const _stack: string = error.stack ? error.stack : err.stack
    error = new ApiError(statusCode, message, _stack, false);
  }

  next(error);
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err: ApiError, _req: Request, res: Response, _next: NextFunction) => {
  let { statusCode, message } = err;
  if (env.isProduction === true && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = 'Internal Server Error';
  }
  res.locals['errorMessage'] = err.message;

  let response = {
    code: statusCode,
    message,
    ...(env.isProduction === false && { stack: err.stack }),
  };

  if (env.isProduction === false) {
    logger.error(err);
    res.status(statusCode).send({error:response});
    return
  }

  const encodeJsonObject = Buffer.from(JSON.stringify(response)).toString("base64")

  res.status(statusCode).send({error:encodeJsonObject});
};
