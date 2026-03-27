"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentRegistry = void 0;
// src/core/component.registry.ts
const provider_registry_1 = require("@om/inyects/provider.registry");
const fs_1 = require("fs");
require("reflect-metadata");
class ComponentRegistry {
    /**
     * Registrar un componente con TODA su metadata
     */
    static register(metadata) {
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
            metadata.imports.forEach((ImportedItem) => {
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
    static getSelectorFromClass(componentClass) {
        // 1. Buscar en classToSelector
        if (this.classToSelector.has(componentClass)) {
            return this.classToSelector.get(componentClass);
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
    static registerParentChild(parentSelector, childSelector) {
        if (!this.parentChildRelations.has(parentSelector)) {
            this.parentChildRelations.set(parentSelector, []);
        }
        const children = this.parentChildRelations.get(parentSelector);
        if (!children.includes(childSelector)) {
            children.push(childSelector);
            console.log(`👥 ${parentSelector} -> ${childSelector} (relación padre-hijo)`);
        }
    }
    /**
     * Obtener metadata completa de un componente
     */
    static getMetadata(selector) {
        const metadata = this.registry.get(selector);
        if (!metadata) {
            return null;
        }
        return metadata;
    }
    /**
     * Obtener clase de componente
     */
    static getComponentClass(selector) {
        return this.getMetadata(selector).componentClass;
    }
    /**
     * Obtener selector desde clase
     */
    static getSelector(componentClass) {
        const selector = this.classToSelector.get(componentClass);
        if (!selector) {
            throw new Error(`🚫 No se encontró selector para la clase: ${componentClass.name}`);
        }
        return selector;
    }
    /**
     * Crear instancia de componente resolviendo dependencias
     */
    static createComponent(selector) {
        const metadata = this.getMetadata(selector);
        // Actualizar estadísticas
        this.updateStats(selector);
        // Resolver dependencias del constructor usando ProviderRegistry
        const paramTypes = Reflect.getMetadata('design:paramtypes', metadata.componentClass) || [];
        const dependencies = paramTypes.map((ParamClass) => {
            if (!ParamClass || ParamClass === Object) {
                throw new Error(`⚠️ No se puede resolver dependencia para ${metadata.componentClass.name}`);
            }
            return provider_registry_1.ProviderRegistry.get(ParamClass);
        });
        // Crear instancia
        let instance = new metadata.componentClass(...dependencies);
        // Marcar como implementa OnInit si corresponde
        if (metadata.implementsOnInit ||
            Reflect.getMetadata('component:implements:OnInit', metadata.componentClass)) {
            instance._implementsOnInit = true;
        }
        instance["imports"] = metadata.imports;
        instance["selector"] = metadata.selector;
        instance["providers"] = dependencies;
        return instance;
    }
    /**
     * Cargar template si es necesario (VERSIÓN CORREGIDA)
     */
    static ensureTemplateLoaded(selector) {
        const metadata = this.getMetadata(selector);
        // Si ya tiene template, nada que hacer
        if (metadata.template) {
            return true;
        }
        // ✅ PRIMERO: Intentar desde templateFullPath (ruta COMPLETA)
        if (metadata.templateFullPath) {
            try {
                const templateContent = (0, fs_1.readFileSync)(metadata.templateFullPath, 'utf8');
                metadata.template = JSON.parse(templateContent);
                this.registry.set(selector, metadata);
                // También actualizar reflect-metadata
                Reflect.defineMetadata('component:template', metadata.template, metadata.componentClass);
                console.log(`✅ Template cargado desde ruta completa: ${selector}`);
                return true;
            }
            catch (error) {
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
            }
            catch (error) {
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
    static loadTemplate(selector) {
        const metadata = this.getMetadata(selector);
        // Si ya tiene template, devolverlo
        if (metadata.template) {
            return metadata.template;
        }
        // Intentar desde templateFullPath primero (más rápido)
        if (metadata.templateFullPath) {
            try {
                return this.loadTemplateFromFullPath(selector);
            }
            catch {
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
    static getTemplate(selector) {
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
    static templateExists(selector) {
        const metadata = this.getMetadata(selector);
        if (metadata.templateFullPath) {
            try {
                const fs = require('fs');
                return fs.existsSync(metadata.templateFullPath);
            }
            catch {
                return false;
            }
        }
        return false;
    }
    /**
     * Actualizar template de un componente
     */
    static setTemplate(selector, template) {
        const metadata = this.getMetadata(selector);
        metadata.template = template;
        this.registry.set(selector, metadata);
        // También en reflect-metadata para compatibilidad
        Reflect.defineMetadata('component:template', template, metadata.componentClass);
    }
    /**
     * Obtener hijos de un componente
     */
    static getChildren(parentSelector) {
        return this.parentChildRelations.get(parentSelector) || [];
    }
    /**
     * Obtener padres de un componente hijo
     */
    static getParents(childSelector) {
        const parents = [];
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
    static hasComponent(selector) {
        return this.registry.has(selector);
    }
    /**
     * Obtener todos los selectores registrados
     */
    static getAllSelectors() {
        return Array.from(this.registry.keys());
    }
    /**
     * Obtener todos los componentes registrados
     */
    static getAll() {
        return Array.from(this.registry.values());
    }
    /**
     * Limpiar registro
     */
    static clear() {
        this.registry.clear();
        this.parentChildRelations.clear();
        this.classToSelector.clear();
        this.stats.clear();
        console.log('🧹 ComponentRegistry completamente limpiado');
    }
    /**
     * Obtener estadísticas
     */
    static getStats() {
        return Array.from(this.stats.entries()).map(([selector, stat]) => ({
            selector,
            ...stat
        }));
    }
    /**
     * Actualizar estadísticas internas
     */
    static updateStats(selector) {
        if (!this.stats.has(selector)) {
            this.stats.set(selector, { instancesCreated: 0 });
        }
        const stat = this.stats.get(selector);
        stat.instancesCreated++;
        stat.lastCreated = new Date();
    }
    /**
     * Actualizar templateFullPath (útil para testing/debug)
     */
    static setTemplateFullPath(selector, templateFullPath) {
        const metadata = this.getMetadata(selector);
        metadata.templateFullPath = templateFullPath;
        this.registry.set(selector, metadata);
        console.log(`📄 templateFullPath actualizado para ${selector}: ${templateFullPath}`);
    }
    /**
     * Obtener ruta completa del template
     */
    static getTemplateFullPath(selector) {
        return this.getMetadata(selector).templateFullPath;
    }
    /**
   * Cargar template desde ruta completa (NUEVO MÉTODO)
   */
    static loadTemplateFromFullPath(selector) {
        const metadata = this.getMetadata(selector);
        if (!metadata.templateFullPath) {
            throw new Error(`🚫 Componente ${selector} no tiene templateFullPath definido`);
        }
        console.log(`📁 Cargando desde: ${metadata.templateFullPath}`);
        try {
            const templateContent = (0, fs_1.readFileSync)(metadata.templateFullPath, 'utf8');
            const template = JSON.parse(templateContent);
            // Guardar en metadata
            metadata.template = template;
            this.registry.set(selector, metadata);
            Reflect.defineMetadata('component:template', template, metadata.componentClass);
            return template;
        }
        catch (error) {
            console.error(`❌ Error cargando template: ${error.message}`);
            throw error;
        }
    }
}
exports.ComponentRegistry = ComponentRegistry;
// Registro principal: selector -> metadata completa
ComponentRegistry.registry = new Map();
// Relaciones padre-hijo
ComponentRegistry.parentChildRelations = new Map();
// Mapa inverso: clase -> selector (para búsquedas)
ComponentRegistry.classToSelector = new Map();
// Estadísticas
ComponentRegistry.stats = new Map();
