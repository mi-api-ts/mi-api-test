"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Module = Module;
const module_registry_1 = require("./module.registry");
function Module(config) {
    return (target) => {
        const moduleName = target.name;
        console.log(`📁 @Module(): ${moduleName}`);
        // 1. Registrar módulo
        module_registry_1.ModuleRegistry.register(moduleName, target, config.declarations, config.providers);
        return target;
    };
}
//# sourceMappingURL=module.decorator.js.map