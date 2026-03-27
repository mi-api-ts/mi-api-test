// src/core/component.registry.ts
import { ProviderRegistry } from '@om/inyects/provider.registry';
import { readFileSync } from 'fs';
import 'reflect-metadata';


export interface ComponentMetadata {
  selector: string;
  componentClass: any;
  templateUrl?: string;
  template?: any;
  imports?: any[];
  filePath?: string;
  templateFullPath?: string
  implementsOnInit?: boolean;
}

export class ComponentRegistry {
  // Registro principal: selector -> metadata completa
  private static registry = new Map<string, ComponentMetadata>();

  // Relaciones padre-hijo
  private static parentChildRelations = new Map<string, string[]>();

  // Mapa inverso: clase -> selector (para búsquedas)
  private static classToSelector = new Map<any, string>();

  // Estadísticas
  private static stats = new Map<string, {
    instancesCreated: number;
    lastCreated?: Date;
  }>();

  /**
   * Registrar un componente con TODA su metadata
   */
  static register(metadata: {
    selector: string;
    componentClass: any;
    templateUrl?: string;
    template?: any;
    imports?: any[];
    filePath?: string;
    templateFullPath?: string;
    implementsOnInit?: boolean;
    metadata?: any;
  }): void {
    const { selector, componentClass } = metadata;

    if (this.registry.has(selector)) {

      return;
    }

    // Guardar metadata completa
    this.registry.set(selector, metadata);

    // Guardar referencia inversa
    this.classToSelector.set(componentClass, selector);

    console.log(`✓ Componente registrado: ${selector}`);

    // Registrar imports como relaciones padre-hijo
    if (metadata.imports && metadata.imports.length > 0) {
      metadata.imports.forEach((ImportedItem: any) => {
        const childSelector = this.getSelectorFromClass(ImportedItem);
        if (childSelector) {
          this.registerParentChild(selector, childSelector);
        }
      });
    }
  }

  /**
   * Obtener selector desde una clase
   */
  static getSelectorFromClass(componentClass: any): string | null {
    // 1. Buscar en classToSelector
    if (this.classToSelector.has(componentClass)) {
      return this.classToSelector.get(componentClass)!;
    }

    // 2. Buscar en metadata reflect
    const selector = Reflect.getMetadata('component:selector', componentClass);
    if (selector) {
      // Auto-registrar si no está en nuestro registro
      if (!this.registry.has(selector)) {
        this.register({
          selector,
          componentClass,
          templateUrl: Reflect.getMetadata('component:templateUrl', componentClass),
          imports: Reflect.getMetadata('component:imports', componentClass),
          implementsOnInit: Reflect.getMetadata('component:implements:OnInit', componentClass)
        });
      }
      return selector;
    }

    return null;
  }

  /**
   * Registrar relación padre-hijo
   */
  static registerParentChild(parentSelector: string, childSelector: string): void {
    if (!this.parentChildRelations.has(parentSelector)) {
      this.parentChildRelations.set(parentSelector, []);
    }

    const children = this.parentChildRelations.get(parentSelector)!;
    if (!children.includes(childSelector)) {
      children.push(childSelector);
      console.log(`👥 ${parentSelector} -> ${childSelector} (relación padre-hijo)`);
    }
  }

  /**
   * Obtener metadata completa de un componente
   */
  static getMetadata(selector: string): ComponentMetadata {
    const metadata = this.registry.get(selector);
    if (!metadata) {
      return null
    }
    return metadata;
  }

  /**
   * Obtener clase de componente
   */
  static getComponentClass(selector: string): any {
    return this.getMetadata(selector).componentClass;
  }

  /**
   * Obtener selector desde clase
   */
  static getSelector(componentClass: any): string {
    const selector = this.classToSelector.get(componentClass);
    if (!selector) {
      throw new Error(`🚫 No se encontró selector para la clase: ${componentClass.name}`);
    }
    return selector;
  }

  /**
   * Crear instancia de componente resolviendo dependencias
   */
  static createComponent(selector: string): any {
    const metadata = this.getMetadata(selector);


    // Actualizar estadísticas
    this.updateStats(selector);

    // Resolver dependencias del constructor usando ProviderRegistry
    const paramTypes = Reflect.getMetadata('design:paramtypes', metadata.componentClass) || [];
    const dependencies = paramTypes.map((ParamClass: any) => {
      if (!ParamClass || ParamClass === Object) {
        throw new Error(`⚠️ No se puede resolver dependencia para ${metadata.componentClass.name}`);
      }
      return ProviderRegistry.get(ParamClass);
    });

    // Crear instancia
    let instance = new metadata.componentClass(...dependencies);

    // Marcar como implementa OnInit si corresponde
    if (metadata.implementsOnInit ||
      Reflect.getMetadata('component:implements:OnInit', metadata.componentClass)) {
      (instance as any)._implementsOnInit = true;
    }
    instance["imports"]=metadata.imports
    instance["selector"]=metadata.selector
    instance["providers"]=dependencies

    return instance;
  }

  /**
   * Cargar template si es necesario (VERSIÓN CORREGIDA)
   */
  static ensureTemplateLoaded(selector: string): boolean {
    const metadata = this.getMetadata(selector);

    // Si ya tiene template, nada que hacer
    if (metadata.template) {
      return true;
    }

    // ✅ PRIMERO: Intentar desde templateFullPath (ruta COMPLETA)
    if (metadata.templateFullPath) {
      try {

        const templateContent = readFileSync(metadata.templateFullPath, 'utf8');
        metadata.template = JSON.parse(templateContent);
        this.registry.set(selector, metadata);

        // También actualizar reflect-metadata
        Reflect.defineMetadata('component:template', metadata.template, metadata.componentClass);

        console.log(`✅ Template cargado desde ruta completa: ${selector}`);
        return true;
      } catch (error: any) {
        console.error(`❌ Error cargando desde templateFullPath: ${error.message}`);
        // Continuar con método alternativo
      }
    }

    // ✅ SEGUNDO: Método antiguo (templateUrl + filePath)
    if (metadata.templateUrl && metadata.filePath) {
      console.log(`🔄 Cargando template (método antiguo): ${metadata.templateUrl}`);
      try {
        const { TemplateLoader } = require("./template-loader");
        const template = TemplateLoader.loadTemplate(metadata.templateUrl, metadata.filePath);

        metadata.template = template;
        this.registry.set(selector, metadata);
        Reflect.defineMetadata('component:template', template, metadata.componentClass);

        console.log(`✅ Template cargado para ${selector}`);
        return true;
      } catch (error: any) {

        return false;
      }
    }

    console.warn(`⚠️ No se puede cargar template para ${selector}:`);
    console.warn(`   - templateFullPath: ${metadata.templateFullPath ? '✅' : '❌'}`);
    console.warn(`   - templateUrl: ${metadata.templateUrl ? '✅' : '❌'}`);
    console.warn(`   - filePath: ${metadata.filePath ? '✅' : '❌'}`);

    return false;
  }
  /**
   * Forzar carga de template (VERSIÓN MEJORADA)
   */
  static loadTemplate(selector: string): any {
    const metadata = this.getMetadata(selector);

    // Si ya tiene template, devolverlo
    if (metadata.template) {
      return metadata.template;
    }

    // Intentar desde templateFullPath primero (más rápido)
    if (metadata.templateFullPath) {
      try {
        return this.loadTemplateFromFullPath(selector);
      } catch {
        // Continuar con método alternativo
      }
    }

    // Método antiguo como fallback
    if (metadata.templateUrl && metadata.filePath) {
      const { TemplateLoader } = require("./template-loader");
      const template = TemplateLoader.loadTemplate(metadata.templateUrl, metadata.filePath);

      metadata.template = template;
      this.registry.set(selector, metadata);
      Reflect.defineMetadata('component:template', template, metadata.componentClass);

      return template;
    }

    throw new Error(`🚫 No se puede cargar template para ${selector}`);
  }

  /**
   * Obtener template (carga si es necesario) - CORREGIDO
   */
  static getTemplate(selector: string): any {
    const metadata = this.getMetadata(selector);

    // Si no tiene template, intentar cargarlo
    if (!metadata.template) {
      this.ensureTemplateLoaded(selector);
    }

    // Verificar nuevamente
    if (!metadata.template) {
      throw new Error(`🚫 No se pudo cargar template para ${selector}`);
    }

    return metadata.template;
  }

  /**
   * Verificar si template existe físicamente
   */
  static templateExists(selector: string): boolean {
    const metadata = this.getMetadata(selector);

    if (metadata.templateFullPath) {
      try {
        const fs = require('fs');
        return fs.existsSync(metadata.templateFullPath);
      } catch {
        return false;
      }
    }

    return false;
  }


  /**
   * Actualizar template de un componente
   */
  static setTemplate(selector: string, template: any): void {
    const metadata = this.getMetadata(selector);
    metadata.template = template;
    this.registry.set(selector, metadata);

    // También en reflect-metadata para compatibilidad
    Reflect.defineMetadata('component:template', template, metadata.componentClass);
  }

  /**
   * Obtener hijos de un componente
   */
  static getChildren(parentSelector: string): string[] {



    return this.parentChildRelations.get(parentSelector) || [];
  }

  /**
   * Obtener padres de un componente hijo
   */
  static getParents(childSelector: string): string[] {
    const parents: string[] = [];
    for (const [parent, children] of this.parentChildRelations) {
      if (children.includes(childSelector)) {
        parents.push(parent);
      }
    }
    return parents;
  }

  /**
   * Verificar si un selector está registrado
   */
  static hasComponent(selector: string): boolean {
    return this.registry.has(selector);
  }

  /**
   * Obtener todos los selectores registrados
   */
  static getAllSelectors(): string[] {
    return Array.from(this.registry.keys());
  }

  /**
   * Obtener todos los componentes registrados
   */
  static getAll(): ComponentMetadata[] {
    return Array.from(this.registry.values());
  }

  /**
   * Limpiar registro
   */
  static clear(): void {
    this.registry.clear();
    this.parentChildRelations.clear();
    this.classToSelector.clear();
    this.stats.clear();
    console.log('🧹 ComponentRegistry completamente limpiado');
  }

  /**
   * Obtener estadísticas
   */
  static getStats(): any {
    return Array.from(this.stats.entries()).map(([selector, stat]) => ({
      selector,
      ...stat
    }));
  }

  /**
   * Actualizar estadísticas internas
   */
  private static updateStats(selector: string): void {
    if (!this.stats.has(selector)) {
      this.stats.set(selector, { instancesCreated: 0 });
    }

    const stat = this.stats.get(selector)!;
    stat.instancesCreated++;
    stat.lastCreated = new Date();
  }


  /**
   * Actualizar templateFullPath (útil para testing/debug)
   */
  static setTemplateFullPath(selector: string, templateFullPath: string): void {
    const metadata = this.getMetadata(selector);
    metadata.templateFullPath = templateFullPath;
    this.registry.set(selector, metadata);
    console.log(`📄 templateFullPath actualizado para ${selector}: ${templateFullPath}`);
  }


  /**
   * Obtener ruta completa del template
   */
  static getTemplateFullPath(selector: string): string | undefined {
    return this.getMetadata(selector).templateFullPath;
  }


  /**
 * Cargar template desde ruta completa (NUEVO MÉTODO)
 */
  static loadTemplateFromFullPath(selector: string): any {
    const metadata = this.getMetadata(selector);

    if (!metadata.templateFullPath) {
      throw new Error(`🚫 Componente ${selector} no tiene templateFullPath definido`);
    }

    console.log(`📁 Cargando desde: ${metadata.templateFullPath}`);

    try {
      const templateContent = readFileSync(metadata.templateFullPath, 'utf8');
      const template = JSON.parse(templateContent);

      // Guardar en metadata
      metadata.template = template;
      this.registry.set(selector, metadata);
      Reflect.defineMetadata('component:template', template, metadata.componentClass);

      return template;
    } catch (error: any) {
      console.error(`❌ Error cargando template: ${error.message}`);
      throw error;
    }
  }

}
