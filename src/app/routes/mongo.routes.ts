import { authenticateAccessToken } from '@core/auth.middleware';
import { BASE_PATH } from '@core/config/constants';
import { inject } from '@om/inyects/provider.registry';
import { MongoController } from 'app/modules/realm-web/mongo.controller';
import express, { type Router } from 'express';


const _realmwebRouter: Router = express.Router();


const _authController = inject(MongoController)

_realmwebRouter.post(
  `${BASE_PATH}/functions/call`,
  authenticateAccessToken,
  _authController.functionsCallHandler
);

_realmwebRouter.get(
  `${BASE_PATH}/functions/call`,
  authenticateAccessToken,
  _authController.functionsCallStreamHandler
);

export default _realmwebRouter;
