"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.guardarJSONCompleto = guardarJSONCompleto;
exports.analyzeRouteHierarchy = analyzeRouteHierarchy;
exports.analyzeRouteHierarchySimple = analyzeRouteHierarchySimple;
exports.generarUID = generarUID;
exports.resolveRouteObservablesSync = resolveRouteObservablesSync;
const fs = require('fs');
const path = require('path');
// Tu objeto
const sistemaValidacion = {
    id: "fase0_validacion_citas",
    tipo: "sistema_validacion_citas",
    // ... resto del objeto
};
// Método 1: Guardar sincrónicamente
function guardarJSONSync(objeto, nombreArchivo) {
    try {
        const datos = JSON.stringify(objeto, null, 2); // El 2 es para indentación
        fs.writeFileSync(nombreArchivo, datos, 'utf8');
        console.log(`Archivo ${nombreArchivo} guardado exitosamente`);
    }
    catch (error) {
        console.error('Error al guardar el archivo:', error);
    }
}
// Método 2: Guardar asincrónicamente (recomendado para archivos grandes)
async function guardarJSONAsync(objeto, nombreArchivo) {
    try {
        const datos = JSON.stringify(objeto, null, 2);
        await fs.promises.writeFile(nombreArchivo, datos, 'utf8');
        console.log(`Archivo ${nombreArchivo} guardado exitosamente`);
    }
    catch (error) {
        console.error('Error al guardar el archivo:', error);
    }
}
// Método 3: Función más completa con manejo de directorios
function guardarJSONCompleto(objeto, rutaArchivo) {
    return new Promise((resolve, reject) => {
        try {
            // Asegurar que el directorio existe
            const directorio = path.dirname(rutaArchivo);
            if (!fs.existsSync(directorio)) {
                fs.mkdirSync(directorio, { recursive: true });
            }
            // Convertir a JSON con formato bonito
            const datos = JSON.stringify(objeto, null, 2);
            // Escribir archivo
            fs.writeFile(rutaArchivo, datos, 'utf8', (error) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve({ success: true, ruta: rutaArchivo });
                }
            });
        }
        catch (error) {
            reject(error);
        }
    });
}
// Ejemplos de uso
`

guardarJSONSync(sistemaValidacion, 'sistema_validacion.json');

guardarJSONAsync(sistemaValidacion, 'sistema_validacion_async.json')
    .then(() => console.log('Guardado completado'))
    .catch(error => console.error(error));

guardarJSONCompleto(sistemaValidacion, './datos/configuraciones/sistema_validacion.json')
    .then(resultado => console.log(resultado))
    .catch(error => console.error(error));


`;
// Definir algunos componentes de ejemplo
class Home1Component {
}
class Home2Component {
}
class AdminComponent {
}
class SettingsComponent {
}
class ProfileComponent {
}
class SecurityComponent {
}
class UserListComponent {
}
const appRoute = [
    { path: '', pathMatch: 'full', redirectTo: 'home1' },
    {
        path: 'home1',
        component: Home1Component
    },
    {
        path: 'home2',
        component: Home2Component
    },
    {
        path: 'admin',
        component: AdminComponent,
        children: [
            {
                path: 'users',
                component: UserListComponent
            },
            {
                path: 'settings',
                component: SettingsComponent,
                children: [
                    {
                        path: 'profile',
                        component: ProfileComponent
                    },
                    {
                        path: 'security',
                        component: SecurityComponent
                    }
                ]
            }
        ]
    }
];
// ────────────────────────────────────────────────
// 2. La función analyzeRouteHierarchy con el cambio mínimo
// ────────────────────────────────────────────────
function analyzeRouteHierarchy(routes, oldPath, newPath) {
    // Normalizar rutas
    const oldNormalized = normalizePath(oldPath);
    const newNormalized = normalizePath(newPath);
    // Obtener jerarquías completas (corregido)
    const oldHierarchy = getFullHierarchy(routes, oldNormalized);
    const newHierarchy = getFullHierarchy(routes, newNormalized);
    // Encontrar componentes descartados
    const discardedComponents = findDiscardedComponents(oldHierarchy, newHierarchy);
    // Encontrar jerarquía común (si existe)
    const commonRoot = findCommonRoot(oldHierarchy, newHierarchy);
    // Convertir newHierarchy al formato correcto + agregar resolve
    const formattedNewHierarchy = newHierarchy.map((item, index) => {
        // Intentamos encontrar la ruta correspondiente para este nivel
        // Usamos la misma lógica de recorrido que getFullHierarchy
        let currentRoutes = routes;
        let routeAtLevel = undefined;
        for (let i = 0; i <= index; i++) {
            const segment = item.segments[i];
            routeAtLevel = currentRoutes.find(r => r.path === segment);
            if (!routeAtLevel)
                break;
            if (routeAtLevel.children) {
                currentRoutes = routeAtLevel.children;
            }
        }
        return {
            component: item.component,
            path: item.fullPath,
            level: item.level,
            isRoot: item.level === 0,
            resolve: routeAtLevel?.resolve // ← agregado: el resolve de esa ruta (o undefined)
        };
    });
    return {
        discardedComponents,
        newHierarchy: formattedNewHierarchy,
        commonRoot
    };
}
// ========================
// FUNCIONES AUXILIARES CORREGIDAS
// ========================
function normalizePath(path) {
    return path.split('/').filter(segment => segment.length > 0);
}
function getFullHierarchy(routes, pathSegments) {
    const hierarchy = [];
    let currentRoutes = routes;
    let accumulatedSegments = [];
    for (let i = 0; i < pathSegments.length; i++) {
        const segment = pathSegments[i];
        const route = findRouteBySegment(currentRoutes, segment);
        if (!route) {
            break; // No hay ruta para este segmento
        }
        accumulatedSegments.push(segment);
        const fullPath = '/' + accumulatedSegments.join('/');
        if (route.component) {
            hierarchy.push({
                component: route.component,
                fullPath,
                segments: [...accumulatedSegments],
                level: i
            });
        }
        // Si tiene children, seguir buscando
        if (route.children) {
            currentRoutes = route.children;
        }
        else {
            break; // No hay más children
        }
    }
    return hierarchy;
}
function findRouteBySegment(routes, segment) {
    return routes.find(route => route.path === segment);
}
function findDiscardedComponents(oldHierarchy, newHierarchy) {
    const discarded = [];
    // Si no hay jerarquía común, se descarta todo
    if (!hasCommonRoot(oldHierarchy, newHierarchy)) {
        // Descartar toda la jerarquía anterior
        oldHierarchy.forEach(item => {
            discarded.push({
                component: item.component,
                path: item.fullPath,
                level: item.level
            });
        });
    }
    else {
        // Encontrar desde dónde divergen
        const divergenceIndex = findDivergenceIndex(oldHierarchy, newHierarchy);
        // Descartar desde el punto de divergencia en adelante
        for (let i = divergenceIndex; i < oldHierarchy.length; i++) {
            discarded.push({
                component: oldHierarchy[i].component,
                path: oldHierarchy[i].fullPath,
                level: oldHierarchy[i].level
            });
        }
    }
    return discarded;
}
function hasCommonRoot(oldHierarchy, newHierarchy) {
    if (oldHierarchy.length === 0 || newHierarchy.length === 0) {
        return false;
    }
    // Verificar si comparten al menos el primer componente
    return oldHierarchy[0]?.component === newHierarchy[0]?.component;
}
function findDivergenceIndex(oldHierarchy, newHierarchy) {
    let i = 0;
    while (i < oldHierarchy.length &&
        i < newHierarchy.length &&
        oldHierarchy[i].component === newHierarchy[i].component) {
        i++;
    }
    return i;
}
function findCommonRoot(oldHierarchy, newHierarchy) {
    if (oldHierarchy.length === 0 || newHierarchy.length === 0) {
        return undefined;
    }
    const firstCommon = oldHierarchy.find((oldItem, index) => index < newHierarchy.length &&
        oldItem.component === newHierarchy[index].component);
    if (firstCommon) {
        return {
            component: firstCommon.component,
            path: firstCommon.fullPath
        };
    }
    return undefined;
}
// ========================
// VERSIÓN MÁS SIMPLE SI QUIERES
// ========================
// OPCIÓN SIMPLIFICADA (menos tipos, más directa)
function analyzeRouteHierarchySimple(routes, oldPath, newPath) {
    const oldNormalized = oldPath.replace(/^\/|\/$/g, '').split('/').filter(Boolean);
    const newNormalized = newPath.replace(/^\/|\/$/g, '').split('/').filter(Boolean);
    const getComponents = (segments) => {
        const components = [];
        let current = routes;
        for (let i = 0; i < segments.length; i++) {
            const route = current.find(r => r.path === segments[i]);
            if (!route)
                break;
            const fullPath = '/' + segments.slice(0, i + 1).join('/');
            if (route.component) {
                components.push({ component: route.component, path: fullPath });
            }
            current = route.children || [];
        }
        return components;
    };
    const oldComponents = getComponents(oldNormalized);
    const newComponents = getComponents(newNormalized);
    // Encontrar índice donde divergen
    let divergeIndex = 0;
    while (divergeIndex < oldComponents.length &&
        divergeIndex < newComponents.length &&
        oldComponents[divergeIndex].component === newComponents[divergeIndex].component) {
        divergeIndex++;
    }
    const discarded = oldComponents.slice(divergeIndex);
    const newHierarchy = newComponents.slice(divergeIndex);
    const commonRoot = divergeIndex > 0 ? oldComponents[divergeIndex - 1] : undefined;
    return {
        discardedComponents: discarded.map(c => ({
            component: c.component,
            path: c.path,
            level: c.path.split('/').length - 2
        })),
        newHierarchy: newComponents.map((c, i) => ({
            component: c.component,
            path: c.path,
            level: i,
            isRoot: i === 0
        })),
        commonRoot
    };
}
function generarUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
function resolveRouteObservablesSync(routeItem) {
    if (!routeItem?.resolve) {
        return routeItem;
    }
    Object.keys(routeItem.resolve).forEach(key => {
        const value = routeItem.resolve[key];
        // Solo si parece un observable
        if (!value || typeof value.subscribe !== 'function') {
            return;
        }
        let capturedValue = null;
        let hasValue = false;
        // Creamos el observer primero (sin referencia a subscription aún)
        const observer = {
            next: (v) => {
                capturedValue = v;
                hasValue = true;
                // Aquí NO podemos usar subscription todavía → lo haremos después
            },
            error: (err) => {
                console.error(`Error resolviendo ${key} en ${routeItem.path}:`, err);
                routeItem.resolve[key] = null;
                // unsubscribe se hará después
            }
        };
        // Ahora sí nos suscribimos
        const subscription = value.subscribe(observer);
        // Después de suscribirnos, si ya hubo emisión síncrona → desuscribimos inmediatamente
        if (hasValue) {
            subscription.unsubscribe();
            routeItem.resolve[key] = capturedValue;
        }
        else {
            // Si NO hubo emisión síncrona (observable asíncrono: http, timer, etc.)
            // Lo más realista es:
            // 1. Dejar el observable como está (no lo resolvemos aquí)
            // 2. O poner null / placeholder
            // 3. O mantener la suscripción abierta (pero tú dijiste que no querías fugas)
            // Opción conservadora más usada en estos casos:
            routeItem.resolve[key] = null; // o undefined
            subscription.unsubscribe(); // limpiamos igual
        }
    });
    return routeItem;
}
