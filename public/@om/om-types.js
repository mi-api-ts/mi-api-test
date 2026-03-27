"use strict";
// src/core/application-config.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROVIDER_TYPE = void 0;
exports.createApplicationConfig = createApplicationConfig;
// ============================================
// FUNCIÓN DE FÁBRICA PARA CREAR CONFIGURACIÓN
// ============================================
function createApplicationConfig(config = {}) {
    const defaultConfig = {
        providers: [],
        compilation: {
            strategy: 'jit',
            incremental: false,
            optimizationLevel: 0,
            treeShaking: true,
            minify: false,
            sourceMap: true,
            strict: false,
            typeChecking: {
                strict: false,
                checkTemplates: true,
                checkInjection: true,
                checkBindings: true,
                strictness: 'warn'
            }
        },
        injector: {
            resolutionStrategy: 'root',
            hierarchical: true,
            lazyServices: false,
            instanceCaching: true,
            circularDependencyTimeout: 5000
        },
        ngZone: {
            enabled: true,
            zoneType: 'stable',
            events: ['click', 'keydown', 'keyup', 'scroll', 'resize'],
            autoDetectChanges: true,
            executionStrategy: 'whenStable'
        },
        renderer: {
            type: 'dom',
            incrementalRendering: false,
            hydration: false,
            sanitization: 'sanitize',
            encapsulation: 'Emulated'
        },
        sanitizer: {
            securityLevel: 'medium',
            allowedUrls: ['http://', 'https://', 'mailto:', 'tel:'],
            allowedProtocols: ['http', 'https', 'mailto', 'tel'],
            allowedAttributes: ['href', 'src', 'alt', 'title', 'class', 'style', 'id'],
            allowedStyles: ['color', 'background-color', 'font-size', 'margin', 'padding'],
            allowedCssClasses: []
        },
        changeDetection: {
            strategy: 'Default',
            autoDetect: true,
            checkInterval: 0,
            asyncPipeOptimization: true,
            maxDepth: 20
        },
        animations: {
            enabled: true,
            driver: 'css',
            defaultDuration: 300,
            defaultEasing: 'ease-in-out',
            reducedMotion: false
        },
        environment: {
            mode: 'development',
            baseUrl: '/',
            apiEndpoint: '/api',
            version: '1.0.0',
            buildTimestamp: new Date().toISOString(),
            features: {}
        },
        experimental: {
            ivy: true,
            incrementalDom: false,
            reactiveFormsV2: false,
            signals: false,
            zoneless: false,
            standaloneComponents: false,
            esbuild: false
        },
        router: {
            navigationStrategy: 'path',
            scrollPositionRestoration: false,
            anchorScrolling: false,
            preloadingStrategy: 'NoPreloading',
            enableTracing: false,
            initialNavigation: 'enabled',
            cancelableNavigation: true
        },
        forms: {
            validationStrategy: 'onSubmit',
            asyncValidators: true,
            defaultErrorMessages: {
                required: 'Este campo es requerido',
                email: 'Ingrese un email válido',
                minlength: 'Longitud mínima no alcanzada',
                maxlength: 'Longitud máxima excedida'
            },
            updateOn: 'change',
            dynamicFormArrays: true
        },
        http: {
            interceptors: [],
            defaultHeaders: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            defaultTimeout: 30000,
            cache: false,
            retryStrategy: {
                maxRetries: 3,
                delay: 1000,
                statusCodes: [500, 502, 503, 504]
            }
        },
        production: {
            enabled: false,
            minify: true,
            uglify: true,
            gzip: true,
            brotli: false,
            dropConsole: true,
            sourceMaps: false,
            optimizationLevel: 2
        },
        development: {
            hotReload: true,
            sourceMaps: true,
            profiling: false,
            debugging: true,
            deprecationWarnings: true,
            warningTimeout: 5000
        },
        testing: {
            framework: 'jasmine',
            testBed: true,
            fixtures: {
                autoDetect: true,
                defaultTimeout: 5000
            },
            mocks: {
                autoGenerate: true,
                mockDepth: 1
            },
            coverage: {
                enabled: false,
                thresholds: {
                    statements: 80,
                    branches: 80,
                    functions: 80,
                    lines: 80
                }
            }
        }
    };
    // Merge profundo de configuraciones
    return deepMerge(defaultConfig, config);
}
// ============================================
// UTILIDADES
// ============================================
function deepMerge(target, source) {
    const output = Object.assign({}, target);
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
                if (!(key in target)) {
                    Object.assign(output, { [key]: source[key] });
                }
                else {
                    output[key] = deepMerge(target[key], source[key]);
                }
            }
            else {
                Object.assign(output, { [key]: source[key] });
            }
        });
    }
    return output;
}
function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
}
// ============================================
// EJEMPLOS DE USO
// ============================================
// Ejemplo 1: Configuración básica
const basicConfig = createApplicationConfig({
    providers: [
    // Proveedores globales aquí
    ],
    environment: {
        mode: 'production',
        apiEndpoint: 'https://api.miapp.com'
    }
});
// Ejemplo 2: Configuración personalizada
const customConfig = createApplicationConfig({
    compilation: {
        strategy: 'aot',
        optimizationLevel: 3,
        treeShaking: true,
        minify: true
    },
    experimental: {
        signals: true,
        standaloneComponents: true
    },
    router: {
        preloadingStrategy: 'PreloadAllModules',
        enableTracing: true
    },
    production: {
        enabled: true,
        brotli: true,
        optimizationLevel: 3
    }
});
// Ejemplo 3: Configuración para testing
const testConfig = createApplicationConfig({
    environment: {
        mode: 'test'
    },
    testing: {
        framework: 'jest',
        coverage: {
            enabled: true,
            thresholds: {
                statements: 90,
                branches: 85,
                functions: 90,
                lines: 90
            }
        }
    },
    development: {
        debugging: false,
        deprecationWarnings: false
    }
});
var PROVIDER_TYPE;
(function (PROVIDER_TYPE) {
    PROVIDER_TYPE["REACT"] = "react";
    PROVIDER_TYPE["ROOT"] = "root";
    PROVIDER_TYPE["DEPENDENCIA"] = "dependencia";
    PROVIDER_TYPE["MODULO"] = "modulo";
    PROVIDER_TYPE["DIALOG"] = "dialog";
})(PROVIDER_TYPE || (exports.PROVIDER_TYPE = PROVIDER_TYPE = {}));
