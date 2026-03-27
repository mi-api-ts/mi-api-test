// src/core/component.factory.ts
import { TemplateCompiler } from "@om/templastes/template-compiler";
import { ComponentRegistry } from "./component.registry";


export class ComponentFactory {
    /**
     * Crea una instancia de componente, asegurando template cargado
     */
    static create<T>(componentClass: new (...args: any[]) => T): T {
        // Obtener selector de la clase
        const selector = ComponentRegistry.getSelector(componentClass);
        
        // ✅ 1. Asegurar template cargado via ComponentRegistry
        ComponentRegistry.ensureTemplateLoaded(selector);
        
        // ✅ 2. Crear instancia via ComponentRegistry (ya maneja dependencias)
        const instance = ComponentRegistry.createComponent(selector);
        
        // ✅ 3. Ejecutar ngOnInit si corresponde
        this.initializeComponent(instance, componentClass);
        
        return instance;
    }
    
    /**
     * Versión alternativa por selector (más útil)
     */
    static createBySelector<T>(selector: string): T {
        // ✅ 1. Asegurar template cargado
        ComponentRegistry.ensureTemplateLoaded(selector);
        
        // ✅ 2. Crear instancia
        const instance = ComponentRegistry.createComponent(selector);
        
        // ✅ 3. Obtener clase para inicialización
        const componentClass = ComponentRegistry.getComponentClass(selector);
        this.initializeComponent(instance, componentClass);
        
        return instance;
    }

    private static initializeComponent(component: any, componentClass: any): void {
        // Verificar si el componente implementa OnInit
        const implementsOnInit = Reflect.getMetadata('component:implements:OnInit', componentClass);

        if (implementsOnInit) {
            if (component.ngOnInit && typeof component.ngOnInit === 'function') {
                console.log(`🔄 Ejecutando ngOnInit() para ${componentClass.name}`);
                component.ngOnInit();
            } else {
                console.warn(`⚠️ ${componentClass.name} marcado como implements OnInit pero no tiene método ngOnInit()`);
            }
        } else {
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
    static render(component: any): any {
        if (!component) {
            throw new Error('Componente no válido');
        }

        const componentClass = component.constructor;
        const selector = ComponentRegistry.getSelector(componentClass);
        
        // ✅ 1. Asegurar template cargado
        ComponentRegistry.ensureTemplateLoaded(selector);
        
        // ✅ 2. Obtener template desde ComponentRegistry
        const template = ComponentRegistry.getTemplate(selector);
        
        if (!template) {
            // Si no hay template, intentar usar método render del componente
            if (component.render && typeof component.render === 'function') {
                return component.render();
            }
            throw new Error(`Componente ${componentClass.name} no tiene template, templateUrl ni método render`);
        }

        // 3. COMPILAR con TemplateCompiler
        return TemplateCompiler.compile(template, component);
    }

    /**
     * Método helper para obtener la ruta del archivo del componente
     * AHORA usa ComponentRegistry
     */
    private static getComponentFilePath(componentClass: any): string {
        try {
            const selector = ComponentRegistry.getSelector(componentClass);
            const metadata = ComponentRegistry.getMetadata(selector);
            return metadata.filePath || '';
        } catch {
            // Fallback si no está en registry
            console.warn(`⚠️ ${componentClass.name} no encontrado en ComponentRegistry`);
            return '';
        }
    }

    static updateContext(component: any, newContext: any): void {
        Object.keys(newContext).forEach(key => {
            if (component[key] !== undefined) {
                component[key] = newContext[key];
            }
        });
    }

    static reloadTemplate(component: any): void {
        const componentClass = component.constructor;
        const selector = ComponentRegistry.getSelector(componentClass);
        const metadata = ComponentRegistry.getMetadata(selector);
        
        if (!metadata.templateUrl) {
            throw new Error('Componente no tiene templateUrl para recargar');
        }

        console.log(`🔄 Recargando template: ${metadata.templateUrl}`);
        
        if (metadata.templateFullPath) {
            // Recargar desde ruta completa
            ComponentRegistry.loadTemplateFromFullPath(selector);
        } else if (metadata.filePath) {
            // Recargar via TemplateLoader
            const { TemplateLoader } = require("@om/templastes/template-loader");
            const newTemplate = TemplateLoader.loadTemplate(metadata.templateUrl, metadata.filePath);
            ComponentRegistry.setTemplate(selector, newTemplate);
        } else {
            throw new Error('No se puede recargar: falta filePath o templateFullPath');
        }
    }

    static renderWithData(component: any, data?: any): any {
        if (data) {
            this.updateContext(component, data);
        }
        return this.render(component);
    }
    
    /**
     * Nuevo: Renderizar por selector
     */
    static renderBySelector(selector: string, context?: any): any {
        const component = this.createBySelector(selector);
        
        if (context) {
            this.updateContext(component, context);
        }
        
        return this.render(component);
    }
}