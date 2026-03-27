"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OmRouteNavigation = void 0;
const injector_1 = require("@om/inyects/injector");
const om_service_1 = require("@om/om_service");
const rxjs_1 = require("rxjs");
let OmRouteNavigation = class OmRouteNavigation {
    constructor(_service) {
        this._service = _service;
        this._unsubscribeAll = new rxjs_1.Subject();
    }
    omInit() {
        console.log("OmRouteNavigation listo");
    }
    /**
     * MÉTODO PRINCIPAL: Recibe parámetros del usuario y devuelve objeto preparado
     */
    navigate(params) {
        const responde = this._navigate(params);
        this._service.captureNavigation(responde)
            .pipe((0, rxjs_1.take)(1))
            .subscribe((vakir) => {
            this._service.deleteHierarchys(vakir.discardedComponents).subscribe(() => {
                this._service.createHierarchys(vakir.newHierarchy).subscribe(() => {
                    this._service.nextNavigate(responde);
                });
            });
        });
    }
    _navigate(params) {
        // Determinar tipo de navegación
        const navType = params.url ? 'byUrl' : (params.relativeTo ? 'relative' : 'absolute');
        // Preparar datos según el tipo
        switch (navType) {
            case 'byUrl':
                return this.prepareUrlNavigation(params);
            case 'relative':
                return this.prepareRelativeNavigation(params);
            default:
                return this.prepareAbsoluteNavigation(params);
        }
    }
    /**
     * Prepara navegación por URL
     */
    prepareUrlNavigation(params) {
        return {
            navigationData: {
                url: params.url,
                extras: {
                    queryParams: params.queryParams,
                    fragment: params.fragment,
                    state: params.state,
                    replaceUrl: params.replaceUrl,
                    skipLocationChange: params.skipLocationChange
                }
            },
            metadata: {
                type: 'byUrl',
                constructedUrl: params.url,
                timestamp: Date.now()
            }
        };
    }
    /**
     * Prepara navegación absoluta
     */
    prepareAbsoluteNavigation(params) {
        const commands = params.commands || [];
        const url = this.constructUrlFromCommands(commands);
        return {
            navigationData: {
                commands: commands,
                extras: {
                    queryParams: params.queryParams,
                    fragment: params.fragment,
                    state: params.state,
                    replaceUrl: params.replaceUrl,
                    skipLocationChange: params.skipLocationChange
                }
            },
            metadata: {
                type: 'absolute',
                constructedUrl: url,
                timestamp: Date.now()
            }
        };
    }
    /**
     * Prepara navegación relativa
     */
    prepareRelativeNavigation(params) {
        // 1. Determinar ruta base
        const baseRoute = this.resolveBaseRoute(params.relativeTo);
        // 2. Construir comandos completos
        const fullCommands = this.buildFullCommands(params.commands || [], baseRoute);
        // 3. Construir URL
        const url = this.constructUrlFromCommands(fullCommands);
        // 4. Preparar relativeTo para extras
        const relativeToRef = this.createRelativeToReference(baseRoute);
        return {
            navigationData: {
                commands: fullCommands,
                extras: {
                    queryParams: params.queryParams,
                    fragment: params.fragment,
                    state: params.state,
                    relativeTo: relativeToRef,
                    replaceUrl: params.replaceUrl,
                    skipLocationChange: params.skipLocationChange
                }
            },
            metadata: {
                type: 'relative',
                baseRoute: baseRoute,
                constructedUrl: url,
                timestamp: Date.now()
            }
        };
    }
    /**
     * Resuelve la ruta base para navegación relativa
     */
    resolveBaseRoute(relativeTo) {
        if (typeof relativeTo === 'string') {
            switch (relativeTo) {
                case 'current':
                    return this.currentRoute || this.pathRoute;
                case 'parent':
                    return this.getParentRoute(this.currentRoute) || this.pathRoute;
            }
        }
        return relativeTo;
    }
    /**
     * Construye comandos completos desde comandos relativos
     */
    buildFullCommands(userCommands, baseRoute) {
        if (!baseRoute?.path)
            return userCommands;
        const baseSegments = baseRoute.path.split('/').filter(s => s);
        // Si no hay comandos del usuario, devolver solo la base
        if (userCommands.length === 0) {
            return [...baseSegments];
        }
        // Procesar sintaxis relativa
        return this.processRelativeCommands(userCommands, baseSegments);
    }
    /**
     * Procesa comandos con sintaxis relativa (., ..)
     */
    processRelativeCommands(commands, baseSegments) {
        const result = [...baseSegments];
        for (let i = 0; i < commands.length; i++) {
            const cmd = commands[i];
            if (i === 0 && typeof cmd === 'string') {
                // Primer comando puede tener sintaxis especial
                if (cmd === '..') {
                    // Subir un nivel
                    result.pop();
                }
                else if (cmd.startsWith('../')) {
                    // Subir múltiples niveles
                    const upCount = (cmd.match(/\.\.\//g) || []).length;
                    const remaining = cmd.replace(/\.\.\//g, '');
                    // Eliminar niveles
                    for (let j = 0; j < upCount; j++) {
                        if (result.length > 0)
                            result.pop();
                    }
                    if (remaining) {
                        result.push(remaining);
                    }
                }
                else if (cmd.startsWith('./')) {
                    // Relativo a actual
                    const remaining = cmd.substring(2);
                    if (remaining) {
                        result.push(remaining);
                    }
                }
                else if (cmd !== '.') {
                    // Segmento normal
                    result.push(cmd);
                }
            }
            else {
                // Otros comandos (parámetros, etc.)
                result.push(cmd);
            }
        }
        return result;
    }
    /**
     * Construye URL desde comandos
     */
    constructUrlFromCommands(commands) {
        if (commands.length === 0)
            return '/';
        const segments = [];
        commands.forEach(cmd => {
            if (typeof cmd === 'string' && cmd) {
                segments.push(cmd);
            }
            else if (typeof cmd === 'object') {
                // Matrix params
                if (segments.length > 0) {
                    const lastSegment = segments[segments.length - 1];
                    const matrixParams = Object.entries(cmd)
                        .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
                        .join(';');
                    segments[segments.length - 1] = `${lastSegment};${matrixParams}`;
                }
            }
        });
        return '/' + segments.join('/');
    }
    /**
     * Crea referencia para relativeTo
     */
    createRelativeToReference(route) {
        // Adapta esto a lo que necesite tu sistema
        return {
            path: route.path,
            routeConfig: route,
            // Agrega más propiedades según tu sistema
        };
    }
    /**
     * Obtiene ruta padre
     */
    getParentRoute(route) {
        if (!route?.path)
            return null;
        const segments = route.path.split('/').filter(s => s);
        if (segments.length <= 1)
            return null;
        return {
            ...route,
            path: '/' + segments.slice(0, -1).join('/'),
            level: route.level - 1
        };
    }
    /**
     * HELPER: Construye comandos (para el ejemplo 4 que mostraste)
     */
    buildCommands(options) {
        const commands = [];
        // Ruta absoluta
        if (options.absolute) {
            commands.push(...options.absolute.split('/').filter(s => s));
        }
        // Usar pathRoute como base
        else if (options.usePathRoute && this.pathRoute?.path) {
            commands.push(...this.pathRoute.path.split('/').filter(s => s));
        }
        // Segmentos adicionales
        if (options.segments?.length) {
            commands.push(...options.segments);
        }
        // Parámetros
        if (options.params && Object.keys(options.params).length > 0) {
            commands.push(options.params);
        }
        return commands;
    }
    /**
     * HELPER: Obtiene ruta actual (para el ejemplo 3 que mostraste)
     */
    getCurrentRoute() {
        // Devuelve lo que necesite tu sistema para relativeTo
        return this.currentRoute ? this.createRelativeToReference(this.currentRoute) : null;
    }
    omDestroyd() {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
};
exports.OmRouteNavigation = OmRouteNavigation;
exports.OmRouteNavigation = OmRouteNavigation = __decorate([
    (0, injector_1.Injectable)({ providedIn: "unique" }),
    __metadata("design:paramtypes", [om_service_1.OmProviders])
], OmRouteNavigation);
//# sourceMappingURL=route.navigation.js.map