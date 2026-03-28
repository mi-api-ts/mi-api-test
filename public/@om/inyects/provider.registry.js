"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderRegistry = exports.ProviderType = void 0;
exports.inject = inject;
// src/core/provider.registry.ts
require("reflect-metadata");
var ProviderType;
(function (ProviderType) {
    ProviderType["ROOT"] = "root";
    ProviderType["UNIQUE"] = "unique"; // Nueva instancia cada vez
})(ProviderType || (exports.ProviderType = ProviderType = {}));
class ProviderRegistry {
    /**
     * Registrar un proveedor
     */
    static register(providerClass, type = ProviderType.ROOT, dependencies // Dependencias explícitas (opcional)
    ) {
        if (this.providers.has(providerClass)) {
            console.warn(`⚠️ Proveedor ya registrado: ${providerClass.name} (omitido)`);
            return;
        }
        this.providers.set(providerClass, {
            type,
            dependencies // Guardar dependencias si se proporcionan
        });
        console.log(`📦 Proveedor registrado: ${providerClass.name} (${type})`);
    }
    /**
     * Obtener instancia de un proveedor (PÚBLICO)
     * Similar a tu Python: getProvider(MiClase)
     */
    static get(providerClass) {
        return this.getService(providerClass, new Set());
    }
    /**
     * Método interno con control de dependencias circulares
     */
    static getService(providerClass, resolving // Para detectar dependencias circulares
    ) {
        const providerInfo = this.providers.get(providerClass);
        if (!providerInfo) {
            throw new Error(`❌ Proveedor no registrado: ${providerClass.name}`);
        }
        // 1. Verificar si es ROOT y ya tiene instancia
        if (providerInfo.type === ProviderType.ROOT && providerInfo.instance) {
            this.updateStats(providerClass, 'reused');
            console.log(`♻️  Reutilizando instancia ROOT: ${providerClass.name}`);
            return providerInfo.instance;
        }
        // 2. Verificar dependencia circular
        if (resolving.has(providerClass)) {
            throw new Error(`🔄 Dependencia circular detectada: ${providerClass.name}`);
        }
        try {
            // 3. Resolver dependencias
            const dependencies = this.resolveDependencies(providerClass, providerInfo, resolving);
            resolving.add(dependencies);
            // 4. Crear instancia
            console.log(`🔄 Creando instancia de: ${providerClass.name} (${providerInfo.type})`);
            const instance = new providerClass(...dependencies);
            // 5. Guardar si es ROOT
            if (providerInfo.type === ProviderType.ROOT) {
                providerInfo.instance = instance;
                this.providers.set(providerClass, providerInfo);
                console.log(`💾 Instancia ROOT guardada: ${providerClass.name}`);
            }
            this.updateStats(providerClass, 'created');
            return instance;
        }
        finally {
            resolving.delete(providerClass);
        }
    }
    /**
     * Resolver dependencias (lo que hacías manualmente en Python)
     */
    static resolveDependencies(providerClass, providerInfo, resolving) {
        // OPCIÓN A: Dependencias explícitas (si se registraron)
        if (providerInfo.dependencies && providerInfo.dependencies.length > 0) {
            console.log(`   📋 Usando dependencias explícitas para ${providerClass.name}`);
            return providerInfo.dependencies.map(depClass => this.getService(depClass, resolving));
        }
        // OPCIÓN B: Dependencias automáticas (vía reflect-metadata)
        let paramTypes = Reflect.getMetadata('design:paramtypes', providerClass) || [];
        console.log(paramTypes);
        paramTypes = paramTypes.filter(x => x);
        if (paramTypes.length > 0) {
            console.log(`   🔍 Dependencias automáticas detectadas: ${paramTypes.map(p => p.name).join(', ')}`);
            return paramTypes.map((paramClass) => {
                // Si el parámetro no es una clase válida, devolver null/undefined
                if (!paramClass || paramClass === Object) {
                    console.warn(`   ⚠️  No se puede resolver dependencia para ${providerClass.name}`);
                    return undefined;
                }
                // Verificar si la dependencia está registrada
                if (!this.providers.has(paramClass)) {
                    // Auto-registrar como UNIQUE si no está registrado
                    console.log(`   📝 Auto-registrando dependencia: ${paramClass.name} (UNIQUE)`);
                    this.register(paramClass, ProviderType.UNIQUE);
                }
                return this.getService(paramClass, resolving);
            });
        }
        // Sin dependencias
        return [];
    }
    /**
     * Métodos de utilidad
     */
    static updateStats(providerClass, action) {
        if (!this.stats.has(providerClass)) {
            this.stats.set(providerClass, { created: 0, reused: 0, lastUsed: new Date() });
        }
        const stat = this.stats.get(providerClass);
        if (action === 'created')
            stat.created++;
        if (action === 'reused')
            stat.reused++;
        stat.lastUsed = new Date();
    }
    /**
     * Verificar si un proveedor está registrado
     */
    static has(providerClass) {
        return this.providers.has(providerClass);
    }
    /**
     * Obtener estadísticas (útil para debug)
     */
    static getStats(providerClass) {
        if (providerClass) {
            return this.stats.get(providerClass) || null;
        }
        return Array.from(this.stats.entries()).map(([cls, stat]) => ({
            provider: cls.name,
            ...stat
        }));
    }
    /**
     * Limpiar todas las instancias (útil para testing)
     */
    static clear() {
        // Limpiar instancias cacheadas pero mantener registro
        for (const [providerClass, info] of this.providers) {
            info.instance = undefined;
        }
        this.stats.clear();
        console.log('🧹 ProviderRegistry limpiado (instancias eliminadas)');
    }
    /**
     * Obtener todos los proveedores registrados
     */
    static getAll() {
        return Array.from(this.providers.entries()).map(([cls, info]) => ({
            name: cls.name,
            type: info.type,
            hasInstance: !!info.instance
        }));
    }
    /**
     * Forzar recreación de una instancia ROOT
     */
    static refresh(providerClass) {
        const providerInfo = this.providers.get(providerClass);
        if (providerInfo && providerInfo.type === ProviderType.ROOT) {
            console.log(`🔄 Refrescando instancia ROOT: ${providerClass.name}`);
            providerInfo.instance = undefined;
            this.providers.set(providerClass, providerInfo);
        }
    }
}
exports.ProviderRegistry = ProviderRegistry;
// Registro de proveedores (clase → configuración)
ProviderRegistry.providers = new Map();
// Estadísticas (opcional, útil para debug)
ProviderRegistry.stats = new Map();
function inject(token) {
    const service = ProviderRegistry.get(token);
    if (!service) {
        throw new Error(`Servicio no encontrado para token: ${token.name || token}`);
    }
    return service;
}
//# sourceMappingURL=provider.registry.js.map