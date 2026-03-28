"use strict";
// src/core/bootstrap.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrap = bootstrap;
exports.startApp = startApp;
const component_registry_1 = require("./components/component.registry");
const provider_registry_1 = require("./inyects/provider.registry");
const om_service_1 = require("./om_service");
/**
 * Bootstrap principal - similar a Angular
 * @param moduleClass Módulo raíz de la aplicación
 */
function bootstrap(moduleClass) {
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
    }
    catch (error) {
        console.error('\n❌ ERROR DURANTE INICIALIZACIÓN:', error.message);
        process.exit(1);
    }
}
/**
 * Configuración del entorno
 */
function setupEnvironment() {
    // Limpiar registros previos
    // Configurar metadatos de reflect-metadata
    if (!Reflect.getMetadata) {
        throw new Error('reflect-metadata no está cargado correctamente');
    }
    console.log('✓ Entorno configurado');
}
/**
 * Inicializar módulo raíz
 */
function initializeModule(moduleClass) {
    // Ejecutar método estático init si existe
    if (moduleClass.init && typeof moduleClass.init === 'function') {
        moduleClass.init();
    }
    else {
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
    const componentes = component_registry_1.ComponentRegistry.getAllSelectors();
    const proveedores = provider_registry_1.ProviderRegistry.getStats();
    return proveedores;
}
async function startApp(moduleClass, config) {
    const omProvider = provider_registry_1.ProviderRegistry.get(om_service_1.OmProviders);
    omProvider.setComponent(moduleClass, config);
}
//# sourceMappingURL=bootstrap.js.map