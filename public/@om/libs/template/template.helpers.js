"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findInJsonObject = findInJsonObject;
/**
 * Busca un elemento por selector (#id) en cualquier nivel de un objeto JSON
 * @param object Objeto donde buscar
 * @param selector Selector con # (ej: "#miId")
 * @returns El elemento encontrado o null
 */
function findInJsonObject(object, selector) {
    if (!object || typeof object !== 'object') {
        return null;
    }
    const searchId = selector.startsWith('#') ? selector.substring(1) : selector;
    // Función recursiva de búsqueda
    function searchRecursive(obj, path = []) {
        // Evitar ciclos infinitos
        if (path.length > 20) { // límite de profundidad
            return null;
        }
        // Si el objeto tiene propiedad 'id' que coincide
        if (obj && typeof obj === 'object') {
            if (obj.id === searchId) {
                return obj;
            }
            // Buscar en TODAS las propiedades del objeto
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    const value = obj[key];
                    // Si es un array, buscar en cada elemento
                    if (Array.isArray(value)) {
                        for (let i = 0; i < value.length; i++) {
                            const result = searchRecursive(value[i], [...path, `${key}[${i}]`]);
                            if (result)
                                return result;
                        }
                    }
                    // Si es objeto, buscar recursivamente
                    else if (value && typeof value === 'object') {
                        const result = searchRecursive(value, [...path, key]);
                        if (result)
                            return result;
                    }
                    // Si es string, verificar si contiene el selector
                    else if (typeof value === 'string' && value.includes(searchId)) {
                        return { foundIn: key, value: value, parent: obj };
                    }
                }
            }
        }
        return null;
    }
    return searchRecursive(object);
}
//# sourceMappingURL=template.helpers.js.map