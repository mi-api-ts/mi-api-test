"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.omIf = omIf;
const omif_provider_1 = require("./omif.provider");
const om_utils_1 = require("@om/om_utils");
const om_helpers_1 = require("@om/om_helpers");
const provider_registry_1 = require("@om/inyects/provider.registry");
function omIf(config, context, parentLib = null) {
    return (target) => {
        const id = (0, om_helpers_1.generarUID)();
        const parent = context;
        const modules = parent.imports || [];
        let isActiveModue = false;
        for (const element of modules) {
            if (element.name === "OmIfModule") {
                isActiveModue = true;
            }
        }
        const provider = provider_registry_1.ProviderRegistry.get(omif_provider_1.OmIfProviders);
        const demo = om_utils_1.OmUtils.extractVariables(config.value);
        provider.id = id;
        provider.objectParent = parent;
        provider.config = config;
        provider.then = demo.then;
        provider.else = demo.else;
        provider.condition = demo.condition;
        provider.parentLib = parentLib;
        if (typeof provider.omInit === "function") {
            provider.omInit();
        }
        return provider.objectData;
    };
}
