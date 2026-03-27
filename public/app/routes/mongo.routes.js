"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_middleware_1 = require("@core/auth.middleware");
const constants_1 = require("@core/config/constants");
const provider_registry_1 = require("@om/inyects/provider.registry");
const mongo_controller_1 = require("app/modules/realm-web/mongo.controller");
const express_1 = __importDefault(require("express"));
const _realmwebRouter = express_1.default.Router();
const _authController = (0, provider_registry_1.inject)(mongo_controller_1.MongoController);
_realmwebRouter.post(`${constants_1.BASE_PATH}/functions/call`, auth_middleware_1.authenticateAccessToken, _authController.functionsCallHandler);
_realmwebRouter.get(`${constants_1.BASE_PATH}/functions/call`, auth_middleware_1.authenticateAccessToken, _authController.functionsCallStreamHandler);
exports.default = _realmwebRouter;
