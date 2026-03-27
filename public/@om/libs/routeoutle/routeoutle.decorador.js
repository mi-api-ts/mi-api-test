"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.omRouteOutle = omRouteOutle;
const routeoutle_provider_1 = require("./routeoutle.provider");
const om_service_1 = require("@om/om_service");
const om_helpers_1 = require("@om/om_helpers");
const provider_registry_1 = require("@om/inyects/provider.registry");
function omRouteOutle(config, classComponent, parentLib) {
    return (target) => {
        const id = (0, om_helpers_1.generarUID)();
        const provider = provider_registry_1.ProviderRegistry.get(routeoutle_provider_1.OmRouteOutleProviders);
        provider.id = id;
        provider.parentLib = parentLib;
        provider.classComponent = classComponent;
        provider.config = config;
        provider.target = target;
        const service = provider_registry_1.ProviderRegistry.get(om_service_1.OmProviders);
        return service.startRouteOutle(provider);
    };
}
