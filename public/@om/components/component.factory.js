"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentFactory = void 0;
// src/core/component.factory.ts
const template_compiler_1 = require("@om/templastes/template-compiler");
const component_registry_1 = require("./component.registry");
class ComponentFactory {
    /**
     * Crea una instancia de componente, asegurando template cargado
     */
    static create(componentClass) {
        // Obtener selector de la clase
        const selector = component_registry_1.ComponentRegistry.getSelector(componentClass);
        // ✅ 1. Asegurar template cargado via ComponentRegistry
        component_registry_1.ComponentRegistry.ensureTemplateLoaded(selector);
        // ✅ 2. Crear instancia via ComponentRegistry (ya maneja dependencias)
        const instance = component_registry_1.ComponentRegistry.createComponent(selector);
        // ✅ 3. Ejecutar ngOnInit si corresponde
        this.initializeComponent(instance, componentClass);
        return instance;
    }
    /**
     * Versión alternativa por selector (más útil)
     */
    static createBySelector(selector) {
        // ✅ 1. Asegurar template cargado
        component_registry_1.ComponentRegistry.ensureTemplateLoaded(selector);
        // ✅ 2. Crear instancia
        const instance = component_registry_1.ComponentRegistry.createComponent(selector);
        // ✅ 3. Obtener clase para inicialización
        const componentClass = component_registry_1.ComponentRegistry.getComponentClass(selector);
        this.initializeComponent(instance, componentClass);
        return instance;
    }
    static initializeComponent(component, componentClass) {
        // Verificar si el componente implementa OnInit
        const implementsOnInit = Reflect.getMetadata('component:implements:OnInit', componentClass);
        if (implementsOnInit) {
            if (component.ngOnInit && typeof component.ngOnInit === 'function') {
                console.log(`🔄 Ejecutando ngOnInit() para ${componentClass.name}`);
                component.ngOnInit();
            }
            else {
                console.warn(`⚠️ ${componentClass.name} marcado como implements OnInit pero no tiene método ngOnInit()`);
            }
        }
        else {
            // Para compatibilidad hacia atrás
            if (component.ngOnInit && typeof component.ngOnInit === 'function') {
                console.log(`🔄 Ejecutando ngOnInit() (sin interfaz) para ${componentClass.name}`);
                component.ngOnInit();
            }
        }
    }
    /**
     * Renderiza el componente usando ComponentRegistry para template
     */
    static render(component) {
        if (!component) {
            throw new Error('Componente no válido');
        }
        const componentClass = component.constructor;
        const selector = component_registry_1.ComponentRegistry.getSelector(componentClass);
        // ✅ 1. Asegurar template cargado
        component_registry_1.ComponentRegistry.ensureTemplateLoaded(selector);
        // ✅ 2. Obtener template desde ComponentRegistry
        const template = component_registry_1.ComponentRegistry.getTemplate(selector);
        if (!template) {
            // Si no hay template, intentar usar método render del componente
            if (component.render && typeof component.render === 'function') {
                return component.render();
            }
            throw new Error(`Componente ${componentClass.name} no tiene template, templateUrl ni método render`);
        }
        // 3. COMPILAR con TemplateCompiler
        return template_compiler_1.TemplateCompiler.compile(template, component);
    }
    /**
     * Método helper para obtener la ruta del archivo del componente
     * AHORA usa ComponentRegistry
     */
    static getComponentFilePath(componentClass) {
        try {
            const selector = component_registry_1.ComponentRegistry.getSelector(componentClass);
            const metadata = component_registry_1.ComponentRegistry.getMetadata(selector);
            return metadata.filePath || '';
        }
        catch {
            // Fallback si no está en registry
            console.warn(`⚠️ ${componentClass.name} no encontrado en ComponentRegistry`);
            return '';
        }
    }
    static updateContext(component, newContext) {
        Object.keys(newContext).forEach(key => {
            if (component[key] !== undefined) {
                component[key] = newContext[key];
            }
        });
    }
    static reloadTemplate(component) {
        const componentClass = component.constructor;
        const selector = component_registry_1.ComponentRegistry.getSelector(componentClass);
        const metadata = component_registry_1.ComponentRegistry.getMetadata(selector);
        if (!metadata.templateUrl) {
            throw new Error('Componente no tiene templateUrl para recargar');
        }
        console.log(`🔄 Recargando template: ${metadata.templateUrl}`);
        if (metadata.templateFullPath) {
            // Recargar desde ruta completa
            component_registry_1.ComponentRegistry.loadTemplateFromFullPath(selector);
        }
        else if (metadata.filePath) {
            // Recargar via TemplateLoader
            const { TemplateLoader } = require("@om/templastes/template-loader");
            const newTemplate = TemplateLoader.loadTemplate(metadata.templateUrl, metadata.filePath);
            component_registry_1.ComponentRegistry.setTemplate(selector, newTemplate);
        }
        else {
            throw new Error('No se puede recargar: falta filePath o templateFullPath');
        }
    }
    static renderWithData(component, data) {
        if (data) {
            this.updateContext(component, data);
        }
        return this.render(component);
    }
    /**
     * Nuevo: Renderizar por selector
     */
    static renderBySelector(selector, context) {
        const component = this.createBySelector(selector);
        if (context) {
            this.updateContext(component, context);
        }
        return this.render(component);
    }
}
exports.ComponentFactory = ComponentFactory;
