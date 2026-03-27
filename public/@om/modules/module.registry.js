"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleRegistry = void 0;
// src/core/module.registry.ts
class ModuleRegistry {
    /**
     * Registrar un módulo
     */
    static register(moduleName, moduleClass, declarations = [], providers = []) {
        if (this.modules.has(moduleName)) {
            console.log(`⚠️ Módulo ya registrado: ${moduleName} (omitido)`);
            return;
        }
        this.modules.set(moduleName, {
            moduleClass,
            declarations,
            providers
        });
        console.log(`📁 Módulo registrado: ${moduleName}`);
    }
    /**
     * Obtener módulo por nombre
     */
    static get(moduleName) {
        const moduleInfo = this.modules.get(moduleName);
        if (!moduleInfo) {
            throw new Error(`Módulo no encontrado: ${moduleName}`);
        }
        return moduleInfo;
    }
    /**
     * Verificar si un módulo está registrado
     */
    static has(moduleName) {
        return this.modules.has(moduleName);
    }
    /**
     * Obtener todos los módulos registrados
     */
    static getAll() {
        return Array.from(this.modules.keys());
    }
    /**
     * Inicializar un módulo (registrar sus componentes y proveedores)
     */
    static initialize(moduleName) {
        const moduleInfo = this.get(moduleName);
        console.log(`🚀 Inicializando módulo: ${moduleName}`);
        // Registrar proveedores del módulo
        moduleInfo.providers.forEach((provider) => {
            const { ProviderRegistry } = require('./provider.registry');
            ProviderRegistry.register(provider);
            console.log(`   📦 Proveedor: ${provider.name}`);
        });
        // Registrar componentes del módulo
        moduleInfo.declarations.forEach((component) => {
            const { ComponentRegistry } = require('./component.registry');
            const selector = Reflect.getMetadata('component:selector', component);
            if (selector) {
                ComponentRegistry.register(selector, component);
                console.log(`   🎯 Componente: ${selector}`);
            }
        });
    }
    /**
     * Limpiar registro
     */
    static clear() {
        this.modules.clear();
        console.log('🧹 ModuleRegistry limpiado');
    }
}
exports.ModuleRegistry = ModuleRegistry;
ModuleRegistry.modules = new Map();
//# sourceMappingURL=module.registry.js.map