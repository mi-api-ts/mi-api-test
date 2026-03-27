import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
  errorCode?: string;
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  const statusCode = err.statusCode || 500;
  const errorCode = err.errorCode || 'InternalServerError';
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    error: message,
    error_code: errorCode
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not found',
    error_code: 'ResourceNotFound',
    path: req.path
  });
};
