// src/core/template-loader.ts (NUEVO ARCHIVO)
import { readFileSync } from 'fs';
import { join, dirname } from 'path';

export class TemplateLoader {
  /**
   * Carga un template desde una URL (ruta de archivo)
   * @param templateUrl Ruta al archivo template (relativa o absoluta)
   * @param componentPath Ruta del archivo del componente para rutas relativas
   */
  static loadTemplate(templateUrl: string, componentPath?: string): any {
    try {
      // Determinar la ruta completa del template
      let templatePath: string;
      
      if (templateUrl.startsWith('./') && componentPath) {
        // Ruta relativa: resolver desde la ubicación del componente
        const componentDir = dirname(componentPath);
        templatePath = join(componentDir, templateUrl.substring(2));
      } else if (templateUrl.startsWith('/')) {
        // Ruta absoluta desde la raíz del proyecto
        templatePath = join(process.cwd(), templateUrl.substring(1));
      } else {
        // Ruta relativa al directorio actual
        templatePath = templateUrl;
      }
      
      console.log(`📁 Cargando template desde: ${templatePath}`);
      
      // Leer el archivo JSON
      const templateContent = readFileSync(templatePath, 'utf8');
      const template = JSON.parse(templateContent);
      
      return template;
    } catch (error) {
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
  static templateExists(templateUrl: string, componentPath?: string): boolean {
    try {
      const fs = require('fs');
      const path = require('path');
      
      let templatePath: string;
      
      if (templateUrl.startsWith('./') && componentPath) {
        const componentDir = dirname(componentPath);
        templatePath = path.join(componentDir, templateUrl.substring(2));
      } else if (templateUrl.startsWith('/')) {
        templatePath = path.join(process.cwd(), templateUrl.substring(1));
      } else {
        templatePath = templateUrl;
      }
      
      return fs.existsSync(templatePath);
    } catch {
      return false;
    }
  }
}