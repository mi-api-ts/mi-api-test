import 'reflect-metadata';
import { ProviderRegistry, ProviderType } from '@om/inyects/provider.registry';


export class Injector {
    private static container = new Map<string, any>();

    static set(token: any, instance: any): void {
        const key = typeof token === 'string' ? token : token.name;
        this.container.set(key, instance);
    }

    static get<T>(token: any): T {
        const key = typeof token === 'string' ? token : token.name;
        const instance = this.container.get(key);

        if (!instance) {
            throw new Error(`❌ ${key} no encontrado en el contenedor`);
        }

        return instance;
    }

    static create<T>(Class: new (...args: any[]) => T): T {
        // Obtener parámetros del constructor
        const paramTypes = Reflect.getMetadata('design:paramtypes', Class) || [];

        // Resolver dependencias
        const dependencies = paramTypes.map((param: any) => {
            try {
                return this.get(param);
            } catch {
                // Si no está registrado, crear nueva instancia
                return new param();
            }
        });

        // Crear instancia
        return new Class(...dependencies);
    }
}

// Decorador Injectable - SOLO registra en ProviderRegistry
// src/core/injectable.decorator.ts

export function Injectable(config?: {
    providedIn?: 'root' | 'unique',
    dependencies?: any[] // Dependencias explícitas
}): ClassDecorator {
    return (target: any) => {
        const type = config?.providedIn === 'root' ? ProviderType.ROOT : ProviderType.UNIQUE;
        // Registrar en ProviderRegistry con dependencias explícitas si las hay
        ProviderRegistry.register(target, type, config?.dependencies);

        console.log(`🏷️  @Injectable(): ${target.name} (${type})`);

        return target;
    };
}
