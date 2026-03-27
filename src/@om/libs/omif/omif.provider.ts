import { Injectable } from "@om/inyects/injector";
import { IOmLib } from "../_interfaces/iolibs";
import { OmUtils } from "@om/om_utils";
import { IChildLib, OmLibProvider, type_proyect } from "../libs.interface";



@Injectable({ providedIn: "unique" })
export class OmIfProviders implements OmLibProvider {
    id: string
    objectData: any = null
    objectParent: any
    config: IOmLib
    objectComponent: any
    condition: string
    then: any = {}
    else: any = null
    target: any
    parentLib: OmLibProvider;
    child: IChildLib[] = []
    type: type_proyect = "om-if"

    constructor() {


    }

    pathPrevious: string;
    path: string;
    pathObjetivo: string;
    classComponent: any;

    omInit(): void {

        console.log("llego hasta om-IF")
        if (this.parentLib) {
            this.parentLib.child.push({ id: this.id, type: "om-if", provider: this })
        }

        this.objectComponent = this.objectParent
        this.reload()

        // MonitorSubscribe.getMonitor(this.objectParent.selector, (evento) => {
        //     console.log(`📋 Librería recibió evento:`, {
        //        tipo: evento.type,
        //        metodo: evento.methodName,
        //        datos: evento.data,
        //        timestamp: new Date(evento.timestamp).toISOString()
        //    });
        //});


    }


    evaluateCondition(condition: string, context: any): boolean {
        try {
            // Validar que la condición tenga el formato correcto
            if (!condition || typeof condition !== 'string') {
                throw new Error(`Condición inválida: ${condition}`);
            }

            // Extraer expresión entre {{ }}
            const match = condition.match(/^\{\{(.+)\}\}$/);
            if (!match) {
                throw new Error(`Formato inválido. Debe ser {{expresión}}: ${condition}`);
            }

            const expression = match[1].trim();

            // Si la expresión está vacía
            if (!expression) {
                throw new Error('Expresión vacía');
            }

            // Función para resolver rutas anidadas de forma segura
            const resolvePath = (obj: any, path: string): any => {
                if (!path || path === '') return obj;

                // Si el objeto es null o undefined, retornar undefined
                if (obj == null) return undefined;

                return path.split('.').reduce((current, part, index, array) => {
                    // Si en algún punto el valor es null o undefined, detener
                    if (current == null) {
                        return undefined;
                    }

                    // Si no existe la propiedad, retornar undefined
                    if (!current.hasOwnProperty(part)) {
                        return undefined;
                    }

                    return current[part];
                }, obj);
            };

            // Función para validar y evaluar argumentos de funciones
            const evaluateArgument = (arg: string): any => {
                arg = arg.trim();

                // Si es string entre comillas
                if ((arg.startsWith("'") && arg.endsWith("'")) ||
                    (arg.startsWith('"') && arg.endsWith('"'))) {
                    return arg.slice(1, -1);
                }

                // Si es número
                if (!isNaN(Number(arg)) && arg !== '') {
                    return Number(arg);
                }

                // Si es booleano
                if (arg === 'true') return true;
                if (arg === 'false') return false;
                if (arg === 'null') return null;
                if (arg === 'undefined') return undefined;

                // Si es una variable del contexto
                return resolvePath(context, arg);
            };

            // Función para evaluar expresiones individuales (variables o métodos)
            const evaluateExpression = (expr: string): any => {
                // Si es un string literal entre comillas, retornarlo directamente
                if ((expr.startsWith("'") && expr.endsWith("'")) ||
                    (expr.startsWith('"') && expr.endsWith('"'))) {
                    return expr.slice(1, -1);
                }

                // Si es un número literal
                if (!isNaN(Number(expr)) && expr !== '') {
                    return Number(expr);
                }

                // Si es un booleano literal
                if (expr === 'true') return true;
                if (expr === 'false') return false;
                if (expr === 'null') return null;
                if (expr === 'undefined') return undefined;

                // Verificar si es una llamada a método
                const methodCallRegex = /^([\w\.]+)\(([^)]*)\)$/;
                const methodMatch = expr.match(methodCallRegex);

                if (methodMatch) {
                    const [, pathWithMethod, argsStr] = methodMatch;

                    // Separar objeto y método
                    const parts = pathWithMethod.split('.');

                    let obj;
                    let methodName;

                    // Caso 1: Es un método de objeto (ej: objeto.metodo())
                    if (parts.length > 1) {
                        methodName = parts.pop()!;
                        const objPath = parts.join('.');
                        obj = resolvePath(context, objPath);

                        // Validar que el objeto exista
                        if (obj == null) {
                            throw new Error(`Objeto no encontrado: ${objPath}`);
                        }

                        // Validar que el método exista y sea una función
                        if (typeof obj[methodName] !== 'function') {
                            throw new Error(`Método no encontrado o no es función: ${objPath}.${methodName}`);
                        }
                    }
                    // Caso 2: Es una función directa en el contexto (ej: funcionPrueba())
                    else {
                        methodName = parts[0];
                        obj = context;

                        // Validar que la función exista y sea una función
                        if (!obj || typeof obj[methodName] !== 'function') {
                            throw new Error(`Función no encontrada o no es función: ${methodName}`);
                        }
                    }

                    // Parsear argumentos
                    const args: any[] = [];
                    if (argsStr.trim() !== '') {
                        // Manejar argumentos correctamente (incluyendo strings con comas internas)
                        const argsArray: string[] = [];
                        let currentArg = '';
                        let inQuotes = false;
                        let quoteChar = '';

                        for (let i = 0; i < argsStr.length; i++) {
                            const char = argsStr[i];

                            if ((char === "'" || char === '"') && (i === 0 || argsStr[i - 1] !== '\\')) {
                                if (!inQuotes) {
                                    inQuotes = true;
                                    quoteChar = char;
                                } else if (char === quoteChar) {
                                    inQuotes = false;
                                }
                                currentArg += char;
                            } else if (char === ',' && !inQuotes) {
                                argsArray.push(currentArg.trim());
                                currentArg = '';
                            } else {
                                currentArg += char;
                            }
                        }

                        if (currentArg.trim() !== '') {
                            argsArray.push(currentArg.trim());
                        }

                        // Evaluar cada argumento
                        args.push(...argsArray.map(evaluateArgument));
                    }

                    try {
                        // Llamar al método/función con el contexto correcto
                        return obj[methodName].apply(obj, args);
                    } catch (methodError) {
                        const methodPath = parts.length > 1 ? `${parts.slice(0, -1).join('.')}.${methodName}` : methodName;
                        throw new Error(`Error ejecutando ${methodPath}: ${methodError.message}`);
                    }
                }

                // No es una llamada a método, es una variable/propiedad
                const value = resolvePath(context, expr);

                // Si no se encuentra la variable, lanzar error
                if (value === undefined) {
                    throw new Error(`Variable no encontrada: ${expr}`);
                }

                return value;
            };

            // Función para tokenizar la expresión
            const tokenizeExpression = (expr: string): string[] => {
                const tokens: string[] = [];
                let currentToken = '';
                let inQuotes = false;
                let quoteChar = '';
                let inParentheses = 0;

                for (let i = 0; i < expr.length; i++) {
                    const char = expr[i];
                    const nextChar = expr[i + 1];

                    // Manejar strings entre comillas
                    if ((char === "'" || char === '"') && (i === 0 || expr[i - 1] !== '\\')) {
                        if (!inQuotes) {
                            inQuotes = true;
                            quoteChar = char;
                        } else if (char === quoteChar) {
                            inQuotes = false;
                        }
                        currentToken += char;
                    }
                    // Manejar paréntesis
                    else if (char === '(' && !inQuotes) {
                        inParentheses++;
                        currentToken += char;
                    }
                    else if (char === ')' && !inQuotes) {
                        inParentheses--;
                        currentToken += char;
                    }
                    // Manejar operadores (solo fuera de strings y paréntesis de método)
                    else if (!inQuotes && inParentheses === 0) {
                        // Verificar si es un operador
                        const operators = ['===', '!==', '==', '!=', '&&', '||', '>=', '<=', '>', '<'];
                        let foundOperator = false;

                        for (const op of operators) {
                            if (expr.substr(i, op.length) === op) {
                                // Guardar token actual si existe
                                if (currentToken.trim()) {
                                    tokens.push(currentToken.trim());
                                    currentToken = '';
                                }
                                // Guardar operador
                                tokens.push(op);
                                i += op.length - 1; // Saltar caracteres del operador
                                foundOperator = true;
                                break;
                            }
                        }

                        if (!foundOperator) {
                            currentToken += char;
                        }
                    } else {
                        currentToken += char;
                    }
                }

                // Añadir último token si existe
                if (currentToken.trim()) {
                    tokens.push(currentToken.trim());
                }

                return tokens;
            };

            // Tokenizar la expresión
            const tokens = tokenizeExpression(expression);

            // Reconstruir expresión evaluando tokens no operadores
            let processedExpr = '';

            for (const token of tokens) {
                // Si es un operador, mantenerlo
                if (['===', '!==', '==', '!=', '&&', '||', '>=', '<=', '>', '<'].includes(token)) {
                    processedExpr += ` ${token} `;
                } else {
                    // Evaluar la expresión (variable, método o literal)
                    const value = evaluateExpression(token);

                    // Convertir a representación JavaScript adecuada
                    let valueStr: string;
                    if (typeof value === 'string') {
                        valueStr = `'${value.replace(/'/g, "\\'")}'`;
                    } else if (typeof value === 'boolean') {
                        valueStr = value.toString();
                    } else if (value === null) {
                        valueStr = 'null';
                    } else if (value === undefined) {
                        valueStr = 'undefined';
                    } else if (typeof value === 'number') {
                        valueStr = value.toString();
                    } else if (typeof value === 'object') {
                        // Para objetos, usar JSON.stringify
                        try {
                            valueStr = JSON.stringify(value);
                        } catch {
                            valueStr = 'null';
                        }
                    } else {
                        valueStr = String(value);
                    }

                    processedExpr += valueStr;
                }
            }

            // Evaluar la expresión final de forma segura
            try {
                // Usar Function constructor en lugar de eval directo
                const evaluator = new Function(`return ${processedExpr}`);
                const result = evaluator();
                return Boolean(result);
            } catch (evalError) {
                throw new Error(`Error evaluando expresión: ${evalError.message}. Expresión: ${processedExpr}`);
            }

        } catch (error) {
            // Loguear error detallado en desarrollo
            if (console && console.error) {
                console.error(`Error evaluando condición: "${condition}"`, error);
            }
            return false;
        }
    }

    omDestroyd(): void {
        const child = this.child

        for (const item of child) {

            item.provider.omDestroyd()

            if (item.provider.objectComponent.omDestroyd && typeof item.provider.objectComponent.omDestroyd() === "function") {
                item.provider.objectComponent.omDestroyd()
                item.provider.objectComponent = null

            }





        }


        ///if (findIdex !== -1)
        //this.parentLib.child.splice(findIdex, 1);

    }

    iniciarAfterViewInit(): void {
        if (typeof this.objectComponent.omAfterViewInit === "function") {
            this.objectComponent.omAfterViewInit()

        }
    }
    iniciarOmInit(): void {
        if (typeof this.objectComponent.omInit === "function") {
            this.objectComponent.omInit()

        }
    }

    iniciarOmDestroyd(): void {
        if (typeof this.objectComponent.omDestroyd === "function") {
            this.objectComponent.omDestroyd()

        }
    }
    iniciarOmChanged(): void {
        if (typeof this.objectComponent.omChanged === "function") {
            this.objectComponent.omChanged()

        }
    }

    reload(): void {
        console.log("se aplico reload en omIf")

        const demo = this.evaluateCondition(this.condition, this.objectParent)
        console.log("cargo child", demo, this.then)
        if (demo === false) {

            if (this.else) {

                this.objectData = OmUtils.compile(this.else, this.objectParent, this)
            } else {
                this.objectData = null
            }


        } else {

            if (this.then) {
                this.objectData = OmUtils.compile(this.then, this.objectParent, this)
            }

        }



        /// Capturamos los lib y lo insertamos para agrupar en el componente
        //Object.assign(this.objectParent, { libs: [...this.objectParent.libs || [], this ] })

    }

    cargarDeps(): void { }
}