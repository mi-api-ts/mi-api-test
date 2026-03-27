import { ComponentFactory } from "@om/components/component.factory";
import { ComponentRegistry } from "@om/components/component.registry";
import { IOmLib } from "../libs/_interfaces/iolibs";
import { omTemplate } from "@om/libs/template/template.decorador";

// src/core/template-compiler.ts (versión corregida)
export class TemplateCompiler {

    static compile(template: any, context: any): any {
        if (!template) return {};

        // Hacer una copia profunda del template
        const result = JSON.parse(JSON.stringify(template));

        // Procesar recursivamente
        return this.processObject(result, context);
    }

    private static processObject(obj: any, context: any): any {
        if (Array.isArray(obj)) {
            return obj.map(item => this.processValue(item, context));
        }

        if (typeof obj === 'object' && obj !== null) {

            // DETECTAR REFERENCIA A COMPONENTE (@component)
            if (obj['@component']) {

                //return this.resolveComponent(obj, context);
            }

            for (const key in obj) {
                let ordenado: IOmLib = {};
                if (key.indexOf("om-template") !== -1) {
                    // Capturar selector (lo que viene después de 'om-template ')
                    const selector = key.substring(11).trim(); // 'om-template '.length = 11
                    const atributos = obj[key];

                    // Ordenar en el formato solicitado
                    ordenado = {
                        lib: "om-template",
                        type: "componente",
                        selector: selector,
                        value: atributos
                    };

                    this.captureLib(ordenado, context)

                    return {}
                }
            }



            // Procesar objeto normal
            const processed: any = {};
            for (const key in obj) {
                processed[key] = this.processValue(obj[key], context);
            }
            return processed;
        }

        return this.processValue(obj, context);
    }

    private static resolveComponent(componentRef: any, parentContext: any): any {
        const selector = componentRef['@component'];

        console.log(`🔍 Template pide componente: ${selector}`);

        // Verificar si el componente está registrado
        if (!ComponentRegistry.hasComponent(selector)) {
            console.warn(`⚠️ ${selector} no está registrado`);
            return { error: `Componente ${selector} no disponible` };
        }

        try {
            // Crear instancia del componente hijo
            const childInstance = ComponentRegistry.createComponent(selector);

            // Si el padre tiene método addChild, conectar
            if (parentContext && parentContext.addChild) {
                parentContext.addChild(childInstance);
            }

            // Renderizar el componente hijo

            const renderedChild = ComponentFactory.render(childInstance);

            console.log(`✅ ${selector} renderizado como hijo`);
            return renderedChild;

        } catch (error: any) {
            console.error(`❌ Error con ${selector}:`, error.message);
            return { error: error.message };
        }
    }

    private static processValue(value: any, context: any): any {
        if (typeof value === 'string') {
            return this.replaceVariablesInString(value, context);
        }

        if (typeof value === 'object' && value !== null) {
            return this.processObject(value, context);
        }

        return value;
    }

    private static replaceVariablesInString(str: string, context: any): any {
        // Caso especial: si el string es exactamente una variable {{var}}
        const exactMatch = str.match(/^\{\{(\w+)\}\}$/);
        if (exactMatch) {
            const varName = exactMatch[1];
            const value = context[varName];

            // Si el valor existe, devolverlo directamente (podría ser cualquier tipo)
            if (value !== undefined) {
                return value;
            }
        }

        // Caso general: reemplazar variables dentro de strings
        if (typeof str !== 'string') return str;

        return str.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
            const value = context[varName];
            if (value === undefined) return match;

            // Devolver como string
            return String(value);
        });
    }

    static extractVariables(template: any): string[] {
        const variables: string[] = [];
        this.collectVariables(template, variables);
        return [...new Set(variables)]; // Eliminar duplicados
    }

    private static collectVariables(obj: any, variables: string[]): void {
        if (typeof obj === 'string') {
            const matches = obj.matchAll(/\{\{(\w+)\}\}/g);
            for (const match of matches) {
                variables.push(match[1]);
            }
        } else if (Array.isArray(obj)) {
            obj.forEach(item => this.collectVariables(item, variables));
        } else if (typeof obj === 'object' && obj !== null) {
            Object.values(obj).forEach(value => this.collectVariables(value, variables));
        }
    }

    private static captureLib(data: IOmLib, parent: any): any {

        if (data.lib === "om-template") {

            // En lugar de @omTemplate, llama a la función directamente
            // Crear una función que simule la aplicación del decorador
            const decoratorFunction = omTemplate(data, parent);

            // Aquí necesitarías una clase para aplicar el decorador
            // Pero como estás dentro de un método estático, no tienes acceso a la clase

            console.log('Decorador omTemplate procesado:', decoratorFunction);
        }

        return {}

    }
}