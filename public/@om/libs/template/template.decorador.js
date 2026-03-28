"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.omTemplate = omTemplate;
const component_registry_1 = require("@om/components/component.registry");
const template_provider_1 = require("./template.provider");
const om_helpers_1 = require("@om/om_helpers");
const om_service_1 = require("@om/om_service");
const provider_registry_1 = require("@om/inyects/provider.registry");
function omTemplate(config, context, parentLib) {
    return (target) => {
        const id = (0, om_helpers_1.generarUID)();
        const parent = context;
        const modules = parent.imports || [];
        let isActiveModue = false;
        for (const element of modules) {
            if (element.name === "OmTemplateModule") {
                isActiveModue = true;
            }
        }
        const newInstance = component_registry_1.ComponentRegistry.getMetadata(config.selector);
        if (!newInstance) {
            return null;
        }
        const provider = provider_registry_1.ProviderRegistry.get(template_provider_1.OmTemplateProviders);
        provider.target = target;
        provider.objectParent = parent;
        provider.config = config;
        provider.parentLib = parentLib;
        provider.id = id;
        const service = provider_registry_1.ProviderRegistry.get(om_service_1.OmProviders);
        //const newInstance = ComponentRegistry.createComponent(config.selector)
        // const templateJson = ComponentRegistry.getTemplate(config.selector)
        return service.startTemlate(provider);
    };
}
//# sourceMappingURL=template.decorador.js.map