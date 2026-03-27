// src/core/provider.registry.ts
import 'reflect-metadata';

export enum ProviderType {
    ROOT = 'root',      // Singleton - misma instancia para todos
    UNIQUE = 'unique'   // Nueva instancia cada vez
}

export class ProviderRegistry {
    // Registro de proveedores (clase → configuración)
    private static providers = new Map<any, {
        type: ProviderType;
        instance?: any;    // Solo para ROOT (cache)
        dependencies?: any[]; // Dependencias explícitas (opcional)
    }>();

    // Estadísticas (opcional, útil para debug)
    private static stats = new Map<any, {
        created: number;
        reused: number;
        lastUsed: Date;
    }>();

    /**
     * Registrar un proveedor
     */
    static register(
        providerClass: any,
        type: ProviderType = ProviderType.ROOT,
        dependencies?: any[] // Dependencias explícitas (opcional)
    ): void {
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
    static get<T>(providerClass: new (...args: any[]) => T): T {
        return this.getService(providerClass, new Set<any>());
    }

    /**
     * Método interno con control de dependencias circulares
     */
    private static getService<T>(
        providerClass: new (...args: any[]) => T,
        resolving: Set<any> // Para detectar dependencias circulares
    ): T {

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

        } finally {
            resolving.delete(providerClass);
        }
    }

    /**
     * Resolver dependencias (lo que hacías manualmente en Python)
     */
    private static resolveDependencies(
        providerClass: any,
        providerInfo: any,
        resolving: Set<any>
    ): any[] {
        // OPCIÓN A: Dependencias explícitas (si se registraron)
        if (providerInfo.dependencies && providerInfo.dependencies.length > 0) {
            console.log(`   📋 Usando dependencias explícitas para ${providerClass.name}`);
            return providerInfo.dependencies.map(depClass =>
                this.getService(depClass, resolving)
            );
        }

        // OPCIÓN B: Dependencias automáticas (vía reflect-metadata)
        let paramTypes = Reflect.getMetadata('design:paramtypes', providerClass) || [];
        console.log(paramTypes)
        paramTypes = paramTypes.filter(x => x)
        if (paramTypes.length > 0) {
            console.log(`   🔍 Dependencias automáticas detectadas: ${paramTypes.map(p => p.name).join(', ')}`);
            return paramTypes.map((paramClass: any) => {
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
    private static updateStats(providerClass: any, action: 'created' | 'reused'): void {
        if (!this.stats.has(providerClass)) {
            this.stats.set(providerClass, { created: 0, reused: 0, lastUsed: new Date() });
        }

        const stat = this.stats.get(providerClass)!;
        if (action === 'created') stat.created++;
        if (action === 'reused') stat.reused++;
        stat.lastUsed = new Date();
    }

    /**
     * Verificar si un proveedor está registrado
     */
    static has(providerClass: any): boolean {
        return this.providers.has(providerClass);
    }

    /**
     * Obtener estadísticas (útil para debug)
     */
    static getStats(providerClass?: any): any {
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
    static clear(): void {
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
    static getAll(): Array<{ name: string, type: ProviderType, hasInstance: boolean }> {
        return Array.from(this.providers.entries()).map(([cls, info]) => ({
            name: cls.name,
            type: info.type,
            hasInstance: !!info.instance
        }));
    }

    /**
     * Forzar recreación de una instancia ROOT
     */
    static refresh(providerClass: any): void {
        const providerInfo = this.providers.get(providerClass);

        if (providerInfo && providerInfo.type === ProviderType.ROOT) {
            console.log(`🔄 Refrescando instancia ROOT: ${providerClass.name}`);
            providerInfo.instance = undefined;
            this.providers.set(providerClass, providerInfo);
        }
    }
}


export function inject<T>(token: new (...args: any[]) => T): T {
    const service = ProviderRegistry.get(token);

    if (!service) {
        throw new Error(`Servicio no encontrado para token: ${token.name || token}`);
    }

    return service as T;
}
