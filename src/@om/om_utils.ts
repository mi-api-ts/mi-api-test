import { IOmLib } from "./libs/_interfaces/iolibs";
import { OmLibProvider } from "./libs/libs.interface";
import { omFor } from "./libs/omfor/omfor.decorador";
import { omIf } from "./libs/omif/omif.decorador";
import { omRouteOutle } from "./libs/routeoutle/routeoutle.decorador";
import { omTemplate } from "./libs/template/template.decorador";

interface RenderContext {
    [key: string]: any;
}


export class OmUtils {



    static compile(template: any, context: any, parentLib: OmLibProvider = null): any {
        if (!template) return {};

        // Hacer una copia profunda del template
        const result = JSON.parse(JSON.stringify(template));

        // Procesar recursivamente
        return this.processObject(result, context, parentLib);
    }

    private static processObject(obj: any, context: any, parentLib: OmLibProvider = null): any {
        // Caso base: si obj es string
        if (typeof obj === "string") {
            if (obj.split(" ").includes("om-template")) { // CORREGIDO: split por espacio, no por guión
                return this.captureLib(obj, null, context, parentLib);
            } else if (obj && typeof obj === "string" && obj === "om-for") {
                const va = this.omForLib(obj, null, context);
                return va
            } else if (obj && typeof obj === "string" && obj === "om-if") {
                const va = this.omIfLib(obj, null, context, parentLib);
                return va
            } else if (obj && typeof obj === "string" && obj === "om-route_outle") {
                const va = this.omRouteOutleLib(obj, null, context, parentLib);
                return va
            }


            return obj;
        }

        // Si es array
        if (Array.isArray(obj)) {
            return obj.map(item => this.processObject(item, context, parentLib));
        }

        // Si es objeto (y no null)
        if (obj !== null && typeof obj === "object") {
            // DETECTAR REFERENCIA A COMPONENTE (@component) - COMENTADO POR AHORA
            // if (obj['@component']) {
            //     return this.resolveComponent(obj, context);
            // }

            // Recorrer todas las propiedades del objeto
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) { // IMPORTANTE: verificar propiedad propia
                    const value = obj[key];

                    // Si es string que contiene "om-template"
                    if (typeof value === "string" && value.split(" ").includes("om-template")) {
                        const va = this.captureLib(value, obj, context, parentLib);
                        return va
                    } else if (value && typeof value === "string" && value === "om-for") {
                        const va = this.omForLib(value, obj, context);
                        return va
                    } else if (value && typeof value === "string" && value === "om-if") {
                        const va = this.omIfLib(value, obj, context, parentLib);
                        return va
                    } else if (value && typeof value === "string" && value === "om-route_outle") {
                        const va = this.omRouteOutleLib(value, obj, context, parentLib);
                        return va
                    }
                    // Si es objeto o array, procesarlo recursivamente
                    else if (value !== null && typeof value === "object") {
                        obj[key] = this.processObject(value, context, parentLib);
                    }
                    // Si es primitivo (number, boolean, etc.), lo dejamos tal cual
                }
            }
            return obj;
        }

        // Para otros tipos (number, boolean, null, undefined)
        return obj;
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

    private static captureLib(data: string, obj, parent: any, parentLib: OmLibProvider = null): any {

        const splitlib = data.split(" ")
        const omTemplateLib = splitlib.indexOf("om-template")


        if (omTemplateLib !== -1) {
            const selector = splitlib[omTemplateLib + 1]

            const demo: IOmLib = {
                lib: "om-template",
                selector,
                type: "componente",
                value: obj

            }
            // En lugar de @omTemplate, llama a la función directamente
            // Crear una función que simule la aplicación del decorador
            const decoratorFunction = omTemplate(demo, parent, parentLib);
            const resultad = decoratorFunction(obj)
            // Aquí necesitarías una clase para aplicar el decorador
            // Pero como estás dentro de un método estático, no tienes acceso a la clase


            return resultad
        }

        else if (!obj) {


        }

        return data

    }

    private static omForLib(data: string, obj, parent: any): any {


        if (data && data === "om-for") {

            const demo: IOmLib = {
                lib: "om-for",
                type: "lista",
                value: obj || "om-for"

            }

            const decoratorFunction = omFor(demo, parent);
            const resultad = decoratorFunction(obj)
            return resultad
        }


        return data

    }

    private static omIfLib(data: string, obj, parent: any, parentLib: OmLibProvider = null): any {


        if (data && data === "om-if") {

            const demo: IOmLib = {
                lib: "om-if",
                type: "condition",
                value: obj || "om-if"

            }

            const decoratorFunction = omIf(demo, parent, parentLib);
            const resultad = decoratorFunction(obj)
            return resultad
        }


        return data

    }

    private static omRouteOutleLib(data: string, obj, parent: any, parentLib: OmLibProvider = null): any {


        if (data && data === "om-route_outle") {

            const demo: IOmLib = {
                lib: "om-route_outle",
                type: "condition",
                value: obj || "om-route_outle"

            }

            const decoratorFunction = omRouteOutle(demo, parent, parentLib);
            const resultad = decoratorFunction(obj)
            return resultad
        }


        return data

    }

    static render<T>(obj: T, context: RenderContext): T {
        return this.processValue(obj, context) as T;
    }

    private static processValue(value: any, context: RenderContext): any {
        if (typeof value === 'string') {
            return this.replaceVariablesInString(value, context);
        }

        if (Array.isArray(value)) {
            return value.map(item => this.processValue(item, context));
        }

        if (typeof value === 'object' && value !== null) {
            const processed: any = {};
            for (const key in value) {
                processed[key] = this.processValue(value[key], context);
            }
            return processed;
        }

        return value;
    }

    static replaceVariablesInString(str: string, context: RenderContext): any {
        // Expresión regular mejorada para capturar paths complejos
        const variableRegex = /\{\{([\w\.\[\]]+?)\}\}/g;

        // Verificar si es una variable exacta
        const exactMatch = str.match(/^\{\{([\w\.\[\]]+?)\}\}$/);
        if (exactMatch) {
            const varPath = exactMatch[1];
            const value = this.getNestedValue(context, varPath);

            // Si encuentra el valor, devolverlo con su tipo original
            if (value !== undefined) {
                return value;
            }
        }

        // Reemplazar variables dentro del string
        return str.replace(variableRegex, (match, varPath) => {
            const value = this.getNestedValue(context, varPath);
            return value !== undefined ? String(value) : match;
        });
    }

    private static getNestedValue(obj: any, path: string): any {
        try {
            return path.split('.').reduce((current, key) => {
                // Manejar acceso a arrays: propiedad[indice]
                const arrayMatch = key.match(/^(\w+)\[(\d+)\]$/);
                if (arrayMatch) {
                    const arrayName = arrayMatch[1];
                    const index = parseInt(arrayMatch[2]);
                    return current && current[arrayName] && current[arrayName][index];
                }

                return current && current[key] !== undefined ? current[key] : undefined;
            }, obj);
        } catch (error) {
            console.warn(`Error accediendo a la propiedad ${path}:`, error);
            return undefined;
        }
    }

    /**
     * Método simple para extraer variables del formato [mi_variable]
     * y convertirlas a un objeto con las variables como propiedades
     */
    static extractVariables(source: Record<string, any>): Record<string, any> {
        const result: Record<string, any> = {};

        for (const [key, value] of Object.entries(source)) {
            // Verificar si la clave es del formato [variable]
            if (key.startsWith('[') && key.endsWith(']')) {
                // Extraer el nombre de la variable (sin los corchetes)
                const variableName = key.slice(1, -1);

                // Asignar el valor a la variable
                result[variableName] = value;
            }
        }

        return result;
    }

    static loadToInstance<T>(instance: any, variables: Record<string, any>): T {
        for (const [key, value] of Object.entries(variables)) {
            // Verificar si la propiedad existe en la instancia
            if (key in instance) {
                // Asignar el valor a la propiedad
                (instance as any)[key] = value;
            }
            // Si no existe, simplemente lo ignoramos
        }

        return instance;
    }




}