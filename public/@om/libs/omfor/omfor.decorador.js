"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.omFor = omFor;
const provider_registry_1 = require("@om/inyects/provider.registry");
const omfor_provider_1 = require("./omfor.provider");
function omFor(config, context) {
    return (target) => {
        const parent = context;
        const modules = parent.imports || [];
        let isActiveModue = false;
        for (const element of modules) {
            if (element.name === "OmForModule") {
                isActiveModue = true;
            }
        }
        const provider = provider_registry_1.ProviderRegistry.get(omfor_provider_1.OmForProviders);
        provider.objectParent = parent;
        provider.config = config;
        if (typeof provider.omInit === "function") {
            provider.omInit();
        }
        return provider.objectData;
    };
}
//# sourceMappingURL=omfor.decorador.js.map