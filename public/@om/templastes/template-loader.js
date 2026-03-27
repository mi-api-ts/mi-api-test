"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateLoader = void 0;
// src/core/template-loader.ts (NUEVO ARCHIVO)
const fs_1 = require("fs");
const path_1 = require("path");
class TemplateLoader {
    /**
     * Carga un template desde una URL (ruta de archivo)
     * @param templateUrl Ruta al archivo template (relativa o absoluta)
     * @param componentPath Ruta del archivo del componente para rutas relativas
     */
    static loadTemplate(templateUrl, componentPath) {
        try {
            // Determinar la ruta completa del template
            let templatePath;
            if (templateUrl.startsWith('./') && componentPath) {
                // Ruta relativa: resolver desde la ubicación del componente
                const componentDir = (0, path_1.dirname)(componentPath);
                templatePath = (0, path_1.join)(componentDir, templateUrl.substring(2));
            }
            else if (templateUrl.startsWith('/')) {
                // Ruta absoluta desde la raíz del proyecto
                templatePath = (0, path_1.join)(process.cwd(), templateUrl.substring(1));
            }
            else {
                // Ruta relativa al directorio actual
                templatePath = templateUrl;
            }
            console.log(`📁 Cargando template desde: ${templatePath}`);
            // Leer el archivo JSON
            const templateContent = (0, fs_1.readFileSync)(templatePath, 'utf8');
            const template = JSON.parse(templateContent);
            return template;
        }
        catch (error) {
            console.error(`❌ Error cargando template: ${templateUrl}`, error);
            // Template de fallback
            return {
                error: `No se pudo cargar el template: ${templateUrl}`,
                fallback: true,
                component: componentPath || 'desconocido'
            };
        }
    }
    /**
     * Verifica si un template URL existe
     */
    static templateExists(templateUrl, componentPath) {
        try {
            const fs = require('fs');
            const path = require('path');
            let templatePath;
            if (templateUrl.startsWith('./') && componentPath) {
                const componentDir = (0, path_1.dirname)(componentPath);
                templatePath = path.join(componentDir, templateUrl.substring(2));
            }
            else if (templateUrl.startsWith('/')) {
                templatePath = path.join(process.cwd(), templateUrl.substring(1));
            }
            else {
                templatePath = templateUrl;
            }
            return fs.existsSync(templatePath);
        }
        catch {
            return false;
        }
    }
}
exports.TemplateLoader = TemplateLoader;
