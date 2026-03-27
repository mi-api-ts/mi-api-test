// src/core/bootstrap.ts

import { ComponentRegistry } from "./components/component.registry";
import { ProviderRegistry } from "./inyects/provider.registry";
import { OmProviders } from "./om_service";

/**
 * Bootstrap principal - similar a Angular
 * @param moduleClass Módulo raíz de la aplicación
 */
export function bootstrap(moduleClass: any): void {
    console.log('🚀 === INICIALIZANDO APLICACIÓN ===\n');

    try {
        // PASO 1: Configuración inicial
        console.log('⚙️  Configurando entorno...');
        setupEnvironment();

        // PASO 2: Inicializar módulo
        console.log('📦 Inicializando módulo principal...');
        initializeModule(moduleClass);

        // PASO 3: Verificar estado
        console.log('\n✅ Verificando estado del sistema...');
        verifySystemState();

        // PASO 4: Aplicación lista
        console.log('\n🎉 APLICACIÓN INICIALIZADA CORRECTAMENTE');
        console.log('=======================================\n');

    } catch (error: any) {
        console.error('\n❌ ERROR DURANTE INICIALIZACIÓN:', error.message);
        process.exit(1);
    }
}

/**
 * Configuración del entorno
 */
function setupEnvironment(): void {
    // Limpiar registros previos

    // Configurar metadatos de reflect-metadata
    if (!(Reflect as any).getMetadata) {
        throw new Error('reflect-metadata no está cargado correctamente');
    }

    console.log('✓ Entorno configurado');
}

/**
 * Inicializar módulo raíz
 */
function initializeModule(moduleClass: any): void {


    // Ejecutar método estático init si existe
    if (moduleClass.init && typeof moduleClass.init === 'function') {

        moduleClass.init();
    } else {
        console.log('⚠️ Módulo no tiene método init(), continuando...');
    }

    // También podríamos ejecutar el constructor si es necesario
    console.log(`✓ Módulo ${moduleClass.name} inicializado`);
}

/**
 * Verificar que el sistema esté listo
 */
// En src/core/bootstrap.ts, corregir verifySystemState():
function verifySystemState() {
    const componentes = ComponentRegistry.getAllSelectors();
    const proveedores = ProviderRegistry.getStats();
    return proveedores

}

export async function startApp(moduleClass: any, config: any): Promise<void> {


    const omProvider = ProviderRegistry.get<OmProviders>(OmProviders)



    omProvider.setComponent(moduleClass, config)

}
