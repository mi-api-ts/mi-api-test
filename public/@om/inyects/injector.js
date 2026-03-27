"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Injector = void 0;
exports.Injectable = Injectable;
require("reflect-metadata");
const provider_registry_1 = require("@om/inyects/provider.registry");
class Injector {
    static set(token, instance) {
        const key = typeof token === 'string' ? token : token.name;
        this.container.set(key, instance);
    }
    static get(token) {
        const key = typeof token === 'string' ? token : token.name;
        const instance = this.container.get(key);
        if (!instance) {
            throw new Error(`❌ ${key} no encontrado en el contenedor`);
        }
        return instance;
    }
    static create(Class) {
        // Obtener parámetros del constructor
        const paramTypes = Reflect.getMetadata('design:paramtypes', Class) || [];
        // Resolver dependencias
        const dependencies = paramTypes.map((param) => {
            try {
                return this.get(param);
            }
            catch {
                // Si no está registrado, crear nueva instancia
                return new param();
            }
        });
        // Crear instancia
        return new Class(...dependencies);
    }
}
exports.Injector = Injector;
Injector.container = new Map();
// Decorador Injectable - SOLO registra en ProviderRegistry
// src/core/injectable.decorator.ts
function Injectable(config) {
    return (target) => {
        const type = config?.providedIn === 'root' ? provider_registry_1.ProviderType.ROOT : provider_registry_1.ProviderType.UNIQUE;
        // Registrar en ProviderRegistry con dependencias explícitas si las hay
        provider_registry_1.ProviderRegistry.register(target, type, config?.dependencies);
        console.log(`🏷️  @Injectable(): ${target.name} (${type})`);
        return target;
    };
}
