import { Request, Response, NextFunction } from 'express';
import { verifyToken } from './utils/token.utils';
import { userExists } from './services/auth.service';
import { ApiError } from './errors';


export interface AuthenticatedRequest extends Request {
  realmUserId?: string;
}

export const authenticateAccessToken = (
  _req: AuthenticatedRequest,
  _res: Response,
  _next: NextFunction
) => {
  const authHeader = _req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'unauthorized')
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);

  if (!payload) {

    throw new ApiError(401, 'invalid token', 'InvalidSession')
  }

  if (payload.type !== 'access') {

    throw new ApiError(401, 'invalid token type - access required')
  }

  if (!userExists(payload.userId)) {
    throw new ApiError(401, 'invalid session', 'InvalidSession')
  }

  _req.realmUserId = payload.userId;
  _next();
  return
};

export const authenticateRefreshToken = (
  _req: AuthenticatedRequest,
  _res: Response,
  _next: NextFunction
) => {
  const authHeader = _req.headers.authorization;
  console.log("_req",   _req)
  if (!authHeader || !authHeader.startsWith('Bearer ')) {

    throw new ApiError(401, 'unauthorized')
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);


  if (!payload) {

    throw new ApiError(401, 'invalid refresh token')

  }

  if (payload.type !== 'refresh') {

    throw new ApiError(401, 'nvalid token type - refresh required')

  }

  if (!userExists(payload.userId)) {
    throw new ApiError(401, 'nvalid session', "InvalidSession")
  }

  _req.realmUserId = payload.userId;
  _next();
  return
};
