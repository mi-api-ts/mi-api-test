"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Component = Component;
// src/core/component.decorator.ts
const component_registry_1 = require("./component.registry");
const path_1 = require("path");
/**
 * Función para obtener la ruta del archivo llamante (basado en tu código)
 */
function getCallerFile() {
    try {
        const stack = new Error().stack || '';
        const stackLines = stack.split('\n');
        // Buscar la línea que corresponde al archivo del componente
        for (let i = 2; i < stackLines.length; i++) {
            const line = stackLines[i];
            // Patrones para diferentes entornos:
            // 1. Node.js: "(/path/to/file.ts:10:20)"
            // 2. Navegador: "at http://localhost:3000/file.ts:10:20"
            // 3. Sin paréntesis: "at /path/to/file.ts:10:20"
            const patterns = [
                /\((.*\.ts):\d+:\d+\)/, // Con paréntesis
                /at (.*\.ts):\d+:\d+/, // Sin paréntesis  
                /\((.*\.js):\d+:\d+\)/, // .js compilado
                /at (.*\.js):\d+:\d+/ // .js sin paréntesis
            ];
            for (const pattern of patterns) {
                const match = line.match(pattern);
                if (match && match[1]) {
                    const filePath = match[1];
                    // Filtrar archivos del framework
                    if (!filePath.includes('component.decorator') &&
                        !filePath.includes('node_modules') &&
                        !filePath.includes('http:') &&
                        !filePath.includes('https:')) {
                        // Si es ruta relativa, hacerla absoluta
                        if (!filePath.startsWith('/') && !filePath.match(/^[A-Za-z]:/)) {
                            return (0, path_1.resolve)(process.cwd(), filePath);
                        }
                        return filePath;
                    }
                }
            }
        }
        return '';
    }
    catch (error) {
        console.warn('⚠️ Error obteniendo caller file:', error);
        return '';
    }
}
/**
 * Extraer rutas únicas de templates (de tu código)
 */
function extractTemplatePaths(templates) {
    const uniquePaths = new Set();
    if (!templates || !Array.isArray(templates)) {
        return [];
    }
    for (const templateObj of templates) {
        if (typeof templateObj === 'string') {
            // Si es string, buscar patron @file://
            const match = templateObj.match(/@file:\/\/(.*?):/);
            if (match && match[1]) {
                uniquePaths.add(match[1]);
            }
        }
        else if (typeof templateObj === 'object') {
            // Si es objeto, buscar en todas sus propiedades
            const objString = JSON.stringify(templateObj);
            const matches = objString.matchAll(/@file:\/\/(.*?):/g);
            for (const match of matches) {
                if (match[1]) {
                    uniquePaths.add(match[1]);
                }
            }
        }
    }
    return Array.from(uniquePaths);
}
function Component(config) {
    return (target) => {
        // 1. OBTENER RUTA DEL ARCHIVO COMPONENTE (usando tu método)
        const componentFilePath = getCallerFile();
        let templateFullPath;
        console.log(`📍 RUTA COMPONENTE CAPTURADA: ${componentFilePath}`);
        // 2. Si tiene templateUrl, calcular ruta completa
        if (config.templateUrl && componentFilePath) {
            const componentDir = (0, path_1.dirname)(componentFilePath);
            templateFullPath = (0, path_1.resolve)(componentDir, config.templateUrl);
            // Verificar si el template existe
            try {
                const fs = require('fs');
                const exists = fs.existsSync(templateFullPath);
                console.log(`📄 TEMPLATE RUTA: ${templateFullPath} ${exists ? '✅' : '❌'}`);
            }
            catch (error) {
                console.log(`📄 TEMPLATE RUTA: ${templateFullPath} (verificación omitida)`);
            }
        }
        // 3. Extraer rutas de template si es objeto (de tu código)
        let templatePaths = [];
        if (config.template && typeof config.template === 'object') {
            templatePaths = extractTemplatePaths([config.template]);
            if (templatePaths.length > 0) {
                console.log(`🔍 Rutas encontradas en template:`, templatePaths);
            }
        }
        // 4. Registrar con rutas CAPTURADAS
        component_registry_1.ComponentRegistry.register({
            selector: config.selector,
            componentClass: target,
            templateUrl: config.templateUrl,
            templateFullPath: templateFullPath,
            template: config.template,
            imports: config.imports || [],
            filePath: componentFilePath, // ← ¡AHORA CON RUTA REAL!
            implementsOnInit: target.prototype.ngOnInit !== undefined,
            metadata: {
                capturedAt: new Date().toISOString(),
                templatePaths: templatePaths
            }
        });
        // 5. Mantener metadata para compatibilidad
        Reflect.defineMetadata('component:selector', config.selector, target);
        if (config.template) {
            Reflect.defineMetadata('component:template', config.template, target);
        }
        if (config.templateUrl) {
            Reflect.defineMetadata('component:templateUrl', config.templateUrl, target);
        }
        if (templateFullPath) {
            Reflect.defineMetadata('component:templateFullPath', templateFullPath, target);
        }
        if (componentFilePath) {
            Reflect.defineMetadata('component:filePath', componentFilePath, target);
        }
        if (config.imports) {
            Reflect.defineMetadata('component:imports', config.imports, target);
        }
        if (target.prototype.ngOnInit !== undefined) {
            Reflect.defineMetadata('component:implements:OnInit', true, target);
        }
        return target;
    };
}
