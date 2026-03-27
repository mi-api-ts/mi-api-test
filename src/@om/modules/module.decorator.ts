
import { ModuleRegistry } from "./module.registry";

export function Module(config: {
    providers?: any[];
    declarations?: any[];
}): ClassDecorator {
    return (target: any) => {
        const moduleName = target.name;

        console.log(`📁 @Module(): ${moduleName}`);

        // 1. Registrar módulo
        ModuleRegistry.register(moduleName, target, config.declarations, config.providers);




        return target;
    };
}
