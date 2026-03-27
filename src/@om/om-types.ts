// src/core/application-config.ts

/**
 * Interfaz ApplicationConfig - Configuración de la aplicación Angular
 */
export interface ApplicationConfig {
    /**
     * Proveedores a nivel de aplicación
     */
    providers?: Array<any>;

    /**
     * Configuración del compilador
     */
    compilation?: CompilationConfig;

    /**
     * Configuración del inyector raíz
     */
    injector?: InjectorConfig;

    /**
     * Configuración de zonas
     */
    ngZone?: NgZoneConfig;

    /**
     * Configuración del renderizador
     */
    renderer?: RendererConfig;

    /**
     * Configuración del sanitizador
     */
    sanitizer?: SanitizerConfig;

    /**
     * Configuración del cambio de detección
     */
    changeDetection?: ChangeDetectionConfig;

    /**
     * Configuración de animaciones
     */
    animations?: AnimationConfig;

    /**
     * Configuración del compilador JIT
     */
    jit?: JitCompilerConfig;

    /**
     * Configuración del compilador AOT
     */
    aot?: AotCompilerConfig;

    /**
     * Configuración del entorno
     */
    environment?: EnvironmentConfig;

    /**
     * Características experimentales
     */
    experimental?: ExperimentalFeatures;

    /**
     * Configuración del router
     */
    router?: RouterConfig;

    /**
     * Configuración de formularios
     */
    forms?: FormsConfig;

    /**
     * Configuración HTTP
     */
    http?: HttpConfig;

    /**
     * Configuración de internacionalización
     */
    i18n?: I18nConfig;

    /**
     * Configuración de Service Workers
     */
    serviceWorker?: ServiceWorkerConfig;

    /**
     * Opciones de producción
     */
    production?: ProductionConfig;

    /**
     * Opciones de desarrollo
     */
    development?: DevelopmentConfig;

    /**
     * Configuración de testing
     */
    testing?: TestingConfig;

    /**
     * Metadata adicional
     */
    [key: string]: any;
}

// ============================================
// SUB-INTERFACES ESPECÍFICAS
// ============================================

export interface CompilationConfig {
    /**
     * Estrategia de compilación: 'jit' | 'aot'
     */
    strategy?: 'jit' | 'aot';

    /**
     * Habilitar compilación incremental
     */
    incremental?: boolean;

    /**
     * Nivel de optimización: 0 | 1 | 2 | 3
     */
    optimizationLevel?: number;

    /**
     * Habilitar tree shaking
     */
    treeShaking?: boolean;

    /**
     * Habilitar minificación
     */
    minify?: boolean;

    /**
     * Generar source maps
     */
    sourceMap?: boolean | 'inline' | 'hidden';

    /**
     * Habilitar modo estricto de TypeScript
     */
    strict?: boolean;

    /**
     * Configuración de tipos
     */
    typeChecking?: TypeCheckingConfig;
}

export interface InjectorConfig {
    /**
     * Estrategia de resolución: 'root' | 'module' | 'component'
     */
    resolutionStrategy?: 'root' | 'module' | 'component';

    /**
     * Habilitar inyección jerárquica
     */
    hierarchical?: boolean;

    /**
     * Lazy loading de servicios
     */
    lazyServices?: boolean;

    /**
     * Cache de instancias
     */
    instanceCaching?: boolean;

    /**
     * Timeout para resolución circular
     */
    circularDependencyTimeout?: number;
}

export interface NgZoneConfig {
    /**
     * Habilitar zona.js
     */
    enabled?: boolean;

    /**
     * Tipo de zona: 'stable' | 'user' | 'microtask'
     */
    zoneType?: string;

    /**
     * Eventos a escuchar
     */
    events?: string[];

    /**
     * Habilitar detección de cambios automática
     */
    autoDetectChanges?: boolean;

    /**
     * Estrategia de ejecución: 'whenStable' | 'onMicrotaskEmpty'
     */
    executionStrategy?: 'whenStable' | 'onMicrotaskEmpty';
}

export interface RendererConfig {
    /**
     * Renderizador a usar: 'dom' | 'server' | 'custom'
     */
    type?: 'dom' | 'server' | 'custom';

    /**
     * Habilitar renderizado incremental
     */
    incrementalRendering?: boolean;

    /**
     * Habilitar hidratación en SSR
     */
    hydration?: boolean;

    /**
     * Estrategia de sanitización
     */
    sanitization?: 'sanitize' | 'trust' | 'none';

    /**
     * Configuración del shadow DOM
     */
    encapsulation?: 'Emulated' | 'Native' | 'None' | 'ShadowDom';
}

export interface SanitizerConfig {
    /**
     * Nivel de sanitización: 'low' | 'medium' | 'high' | 'none'
     */
    securityLevel?: 'low' | 'medium' | 'high' | 'none';

    /**
     * URLs permitidas
     */
    allowedUrls?: string[];

    /**
     * Protocolos permitidos
     */
    allowedProtocols?: string[];

    /**
     * Atributos permitidos
     */
    allowedAttributes?: string[];

    /**
     * Estilos permitidos
     */
    allowedStyles?: string[];

    /**
     * Clases CSS permitidas
     */
    allowedCssClasses?: string[];
}

export interface ChangeDetectionConfig {
    /**
     * Estrategia: 'Default' | 'OnPush'
     */
    strategy?: 'Default' | 'OnPush';

    /**
     * Habilitar detección automática
     */
    autoDetect?: boolean;

    /**
     * Intervalo de verificación (ms)
     */
    checkInterval?: number;

    /**
     * Habilitar Async pipe optimizado
     */
    asyncPipeOptimization?: boolean;

    /**
     * Profundidad máxima de verificación
     */
    maxDepth?: number;
}

export interface AnimationConfig {
    /**
     * Habilitar animaciones
     */
    enabled?: boolean;

    /**
     * Driver de animación: 'css' | 'js' | 'web-animations'
     */
    driver?: 'css' | 'js' | 'web-animations';

    /**
     * Duración por defecto (ms)
     */
    defaultDuration?: number;

    /**
     * Easing por defecto
     */
    defaultEasing?: string;

    /**
     * Habilitar animaciones reducidas
     */
    reducedMotion?: boolean;
}

export interface JitCompilerConfig {
    /**
     * Habilitar compilación JIT
     */
    enabled?: boolean;

    /**
     * Cache de templates
     */
    templateCache?: boolean;

    /**
     * Tamaño máximo de cache
     */
    maxCacheSize?: number;

    /**
     * Habilitar optimizaciones en tiempo real
     */
    runtimeOptimizations?: boolean;
}

export interface AotCompilerConfig {
    /**
     * Habilitar compilación AOT
     */
    enabled?: boolean;

    /**
     * Eliminar metadata de decoradores
     */
    stripDecorators?: boolean;

    /**
     * Generar código ES5
     */
    targetEs5?: boolean;

    /**
     * Habilitar dead code elimination
     */
    deadCodeElimination?: boolean;

    /**
     * Habilitar renombrado de propiedades
     */
    propertyRenaming?: boolean;

    /**
     * Nivel de optimización: 0 | 1 | 2 | 3
     */
    optimizationLevel?: number;
}

export interface EnvironmentConfig {
    /**
     * Modo: 'development' | 'production' | 'test'
     */
    mode?: 'development' | 'production' | 'test';

    /**
     * URL base de la aplicación
     */
    baseUrl?: string;

    /**
     * API endpoint
     */
    apiEndpoint?: string;

    /**
     * Versión de la aplicación
     */
    version?: string;

    /**
     * Build timestamp
     */
    buildTimestamp?: string;

    /**
     * Características habilitadas
     */
    features?: Record<string, boolean>;
}

export interface ExperimentalFeatures {
    /**
     * Habilitar Ivy (nuevo compilador)
     */
    ivy?: boolean;

    /**
     * Habilitar renderizado incremental
     */
    incrementalDom?: boolean;

    /**
     * Habilitar reactive forms mejorados
     */
    reactiveFormsV2?: boolean;

    /**
     * Habilitar signals (nuevo sistema reactivo)
     */
    signals?: boolean;

    /**
     * Habilitar zoneless change detection
     */
    zoneless?: boolean;

    /**
     * Habilitar standalone components
     */
    standaloneComponents?: boolean;

    /**
     * Habilitar esbuild como bundler
     */
    esbuild?: boolean;
}

export interface RouterConfig {
    /**
     * Estrategia de navegación: 'hash' | 'path'
     */
    navigationStrategy?: 'hash' | 'path';

    /**
     * Habilitar scroll position restoration
     */
    scrollPositionRestoration?: boolean;

    /**
     * Habilitar anchor scrolling
     */
    anchorScrolling?: boolean;

    /**
     * Estrategia de preloading
     */
    preloadingStrategy?: 'PreloadAllModules' | 'NoPreloading' | 'PreloadFeatureModules';

    /**
     * Habilitar tracing
     */
    enableTracing?: boolean;

    /**
     * URL inicial
     */
    initialNavigation?: 'enabled' | 'disabled' | 'enabledBlocking';

    /**
     * Error handler personalizado
     */
    errorHandler?: any;

    /**
     * Eventos cancelables
     */
    cancelableNavigation?: boolean;

    /**
     * Resolver de rutas por defecto
     */
    defaultRouteResolver?: any;
}

export interface FormsConfig {
    /**
     * Estrategia de validación: 'onSubmit' | 'onChange' | 'onBlur'
     */
    validationStrategy?: 'onSubmit' | 'onChange' | 'onBlur';

    /**
     * Habilitar validadores asíncronos
     */
    asyncValidators?: boolean;

    /**
     * Mensajes de error por defecto
     */
    defaultErrorMessages?: Record<string, string>;

    /**
     * Actualización de valor por defecto
     */
    updateOn?: 'change' | 'blur' | 'submit';

    /**
     * Habilitar form arrays dinámicos
     */
    dynamicFormArrays?: boolean;
}

export interface HttpConfig {
    /**
     * Interceptores globales
     */
    interceptors?: any[];

    /**
     * Headers por defecto
     */
    defaultHeaders?: Record<string, string>;

    /**
     * Timeout por defecto (ms)
     */
    defaultTimeout?: number;

    /**
     * Habilitar cache HTTP
     */
    cache?: boolean;

    /**
     * Estrategia de retry
     */
    retryStrategy?: {
        maxRetries?: number;
        delay?: number;
        statusCodes?: number[];
    };

    /**
     * Base URL para todas las peticiones
     */
    baseUrl?: string;
}

export interface I18nConfig {
    /**
     * Locale por defecto
     */
    defaultLocale?: string;

    /**
     * Locales disponibles
     */
    availableLocales?: string[];

    /**
     * Estrategia de carga: 'static' | 'dynamic'
     */
    loadingStrategy?: 'static' | 'dynamic';

    /**
     * Archivos de traducción
     */
    translationFiles?: Record<string, string>;

    /**
     * Habilitar pluralización
     */
    pluralization?: boolean;

    /**
     * Habilitar formatos de fecha/hora localizados
     */
    localizedFormats?: boolean;
}

export interface ServiceWorkerConfig {
    /**
     * Habilitar Service Worker
     */
    enabled?: boolean;

    /**
     * Estrategia de cache
     */
    cachingStrategy?: 'networkFirst' | 'cacheFirst' | 'staleWhileRevalidate';

    /**
     * Assets para pre-cache
     */
    precacheAssets?: string[];

    /**
     * Runtime cache
     */
    runtimeCache?: Array<{
        urlPattern: RegExp | string;
        handler: string;
        options?: any;
    }>;

    /**
     * Habilitar actualizaciones automáticas
     */
    autoUpdate?: boolean;

    /**
     * Notificar actualizaciones
     */
    notifyUpdates?: boolean;
}

export interface ProductionConfig {
    /**
     * Habilitar modo producción
     */
    enabled?: boolean;

    /**
     * Habilitar minificación
     */
    minify?: boolean;

    /**
     * Habilitar uglify
     */
    uglify?: boolean;

    /**
     * Habilitar gzip
     */
    gzip?: boolean;

    /**
     * Habilitar brotli
     */
    brotli?: boolean;

    /**
     * Eliminar console.log
     */
    dropConsole?: boolean;

    /**
     * Habilitar source maps
     */
    sourceMaps?: boolean;

    /**
     * Nivel de optimización
     */
    optimizationLevel?: number;
}

export interface DevelopmentConfig {
    /**
     * Habilitar hot reload
     */
    hotReload?: boolean;

    /**
     * Habilitar source maps
     */
    sourceMaps?: boolean;

    /**
     * Habilitar profiling
     */
    profiling?: boolean;

    /**
     * Habilitar debugging
     */
    debugging?: boolean;

    /**
     * Mostrar advertencias de deprecación
     */
    deprecationWarnings?: boolean;

    /**
     * Timeout para warnings (ms)
     */
    warningTimeout?: number;
}

export interface TestingConfig {
    /**
     * Framework de testing: 'jasmine' | 'jest' | 'mocha'
     */
    framework?: 'jasmine' | 'jest' | 'mocha';

    /**
     * Habilitar TestBed
     */
    testBed?: boolean;

    /**
     * Configuración de fixtures
     */
    fixtures?: {
        autoDetect?: boolean;
        defaultTimeout?: number;
    };

    /**
     * Configuración de mocks
     */
    mocks?: {
        autoGenerate?: boolean;
        mockDepth?: number;
    };

    /**
     * Configuración de coverage
     */
    coverage?: {
        enabled?: boolean;
        thresholds?: {
            statements?: number;
            branches?: number;
            functions?: number;
            lines?: number;
        };
    };
}

export interface TypeCheckingConfig {
    /**
     * Habilitar verificación estricta de tipos
     */
    strict?: boolean;

    /**
     * Verificar templates
     */
    checkTemplates?: boolean;

    /**
     * Verificar inyección de dependencias
     */
    checkInjection?: boolean;

    /**
     * Verificar bindings
     */
    checkBindings?: boolean;

    /**
     * Nivel de strictness: 'off' | 'warn' | 'error'
     */
    strictness?: 'off' | 'warn' | 'error';
}

// ============================================
// FUNCIÓN DE FÁBRICA PARA CREAR CONFIGURACIÓN
// ============================================

export function createApplicationConfig(
    config: Partial<ApplicationConfig> = {}
): ApplicationConfig {
    const defaultConfig: ApplicationConfig = {
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

function deepMerge(target: any, source: any): any {
    const output = Object.assign({}, target);

    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
                if (!(key in target)) {
                    Object.assign(output, { [key]: source[key] });
                } else {
                    output[key] = deepMerge(target[key], source[key]);
                }
            } else {
                Object.assign(output, { [key]: source[key] });
            }
        });
    }

    return output;
}

function isObject(item: any): boolean {
    return item && typeof item === 'object' && !Array.isArray(item);
}

// ============================================
// EJEMPLOS DE USO
// ============================================

// Ejemplo 1: Configuración básica
const basicConfig: ApplicationConfig = createApplicationConfig({
    providers: [
        // Proveedores globales aquí
    ],
    environment: {
        mode: 'production',
        apiEndpoint: 'https://api.miapp.com'
    }
});

// Ejemplo 2: Configuración personalizada
const customConfig: ApplicationConfig = createApplicationConfig({
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
const testConfig: ApplicationConfig = createApplicationConfig({
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


export enum PROVIDER_TYPE {
  REACT = "react",
  ROOT = "root",
  DEPENDENCIA = "dependencia",
  MODULO = "modulo",
  DIALOG = "dialog"
}
