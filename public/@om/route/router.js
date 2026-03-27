"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// 1. INICIALIZACIÓN DEL ROUTER
class Router {
    constructor(routes) {
        this.currentRoute = null;
        this.routes = routes;
        this.initialize();
    }
    initialize() {
        // 2. DETECTA LA URL ACTUAL
        const currentPath = window.location.pathname;
        console.log('📡 URL detectada:', currentPath);
        // 3. BUSCA LA RUTA CORRESPONDIENTE
        const matchedRoute = this.findRoute(currentPath);
        if (matchedRoute) {
            // 4. ACTIVA LA RUTA
            this.activateRoute(matchedRoute);
        }
    }
    findRoute(path) {
        // Simplificado: busca la ruta que coincida
        return this.routes.find(route => {
            if (route.path === '') {
                return path === '/' || path === '';
            }
            return path === `/${route.path}`;
        });
    }
    activateRoute(route) {
        console.log('🔄 Activando ruta:', route.path);
        // 5. DESACTIVA EL COMPONENTE ACTUAL (si existe)
        if (this.currentRoute && this.currentRoute.component) {
            console.log('🔴 Desactivando componente actual');
            // Aquí iría la lógica de destrucción del componente
        }
        // 6. CREA NUEVA INSTANCIA DEL COMPONENTE
        console.log('🟢 Creando instancia del componente:', route.component.name);
        const componentInstance = new route.component();
        // 7. INICIALIZA EL COMPONENTE
        if (componentInstance.ngOnInit) {
            componentInstance.ngOnInit();
        }
        // 9. ACTUALIZA EL ESTADO DEL ROUTER
        this.currentRoute = route;
        console.log('✅ Ruta activada:', route.path);
    }
}
