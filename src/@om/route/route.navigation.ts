import { OmDestroyd } from "@om/components/interfaces/on-destroyd.interface";
import { OmInit } from "@om/components/interfaces/on-init.interface";
import { Injectable } from "@om/inyects/injector";
import { OmLibProvider } from "@om/libs/libs.interface";
import { INeewHierarchy } from "@om/om_helpers";
import { OmProviders } from "@om/om_service";
import { Subject, take, takeUntil } from "rxjs";

export interface PreparedNavigation {
    // Datos listos para usar en tu sistema
    navigationData: {
        commands?: any[];
        url?: string;
        extras: {
            queryParams?: Record<string, any>;
            fragment?: string;
            state?: Record<string, any>;
            relativeTo?: any;
            replaceUrl?: boolean;
            skipLocationChange?: boolean;
        };
    };

    // Información adicional útil
    metadata: {
        type: 'absolute' | 'relative' | 'byUrl';
        baseRoute?: INeewHierarchy;
        constructedUrl: string;
        timestamp: number;
    };
}

export interface NavigationParams {
    // Modo 1: Navegación por URL (navigateByUrl)
    url?: string;

    // Modo 2: Navegación por comandos (navigate)
    commands?: any[];

    // Para navegación relativa
    relativeTo?: 'current' | 'parent' | INeewHierarchy;

    // Parámetros estándar
    queryParams?: Record<string, any>;
    fragment?: string;
    state?: Record<string, any>;
    replaceUrl?: boolean;
    skipLocationChange?: boolean;
}

@Injectable({ providedIn: "unique" })
export class OmRouteNavigation implements OmInit, OmDestroyd {
    pathRoute: INeewHierarchy;
    currentRoute: INeewHierarchy;
    objectLib: OmLibProvider
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(private _service: OmProviders) { }




    omInit(): void {
        console.log("OmRouteNavigation listo");
    }

    /**
     * MÉTODO PRINCIPAL: Recibe parámetros del usuario y devuelve objeto preparado
     */
    navigate(params: NavigationParams): void {

        const responde = this._navigate(params)

        this._service.captureNavigation(responde)
            .pipe(take(1))
            .subscribe((vakir) => {
                this._service.deleteHierarchys(vakir.discardedComponents).subscribe(() => {
                    this._service.createHierarchys(vakir.newHierarchy).subscribe(() => {

                        this._service.nextNavigate(responde)
                    })


                })


            })

    }

    private _navigate(params: NavigationParams): PreparedNavigation {
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
    private prepareUrlNavigation(params: NavigationParams): PreparedNavigation {
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
                constructedUrl: params.url!,
                timestamp: Date.now()
            }
        };
    }

    /**
     * Prepara navegación absoluta
     */
    private prepareAbsoluteNavigation(params: NavigationParams): PreparedNavigation {
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
    private prepareRelativeNavigation(params: NavigationParams): PreparedNavigation {
        // 1. Determinar ruta base
        const baseRoute = this.resolveBaseRoute(params.relativeTo!);

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
    private resolveBaseRoute(relativeTo: 'current' | 'parent' | INeewHierarchy): INeewHierarchy {
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
    private buildFullCommands(userCommands: any[], baseRoute: INeewHierarchy): any[] {
        if (!baseRoute?.path) return userCommands;

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
    private processRelativeCommands(commands: any[], baseSegments: string[]): any[] {
        const result: any[] = [...baseSegments];

        for (let i = 0; i < commands.length; i++) {
            const cmd = commands[i];

            if (i === 0 && typeof cmd === 'string') {
                // Primer comando puede tener sintaxis especial
                if (cmd === '..') {
                    // Subir un nivel
                    result.pop();
                } else if (cmd.startsWith('../')) {
                    // Subir múltiples niveles
                    const upCount = (cmd.match(/\.\.\//g) || []).length;
                    const remaining = cmd.replace(/\.\.\//g, '');

                    // Eliminar niveles
                    for (let j = 0; j < upCount; j++) {
                        if (result.length > 0) result.pop();
                    }

                    if (remaining) {
                        result.push(remaining);
                    }
                } else if (cmd.startsWith('./')) {
                    // Relativo a actual
                    const remaining = cmd.substring(2);
                    if (remaining) {
                        result.push(remaining);
                    }
                } else if (cmd !== '.') {
                    // Segmento normal
                    result.push(cmd);
                }
            } else {
                // Otros comandos (parámetros, etc.)
                result.push(cmd);
            }
        }

        return result;
    }

    /**
     * Construye URL desde comandos
     */
    private constructUrlFromCommands(commands: any[]): string {
        if (commands.length === 0) return '/';

        const segments: string[] = [];

        commands.forEach(cmd => {
            if (typeof cmd === 'string' && cmd) {
                segments.push(cmd);
            } else if (typeof cmd === 'object') {
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
    private createRelativeToReference(route: INeewHierarchy): any {
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
    private getParentRoute(route: INeewHierarchy): INeewHierarchy | null {
        if (!route?.path) return null;

        const segments = route.path.split('/').filter(s => s);
        if (segments.length <= 1) return null;

        return {
            ...route,
            path: '/' + segments.slice(0, -1).join('/'),
            level: route.level - 1
        };
    }

    /**
     * HELPER: Construye comandos (para el ejemplo 4 que mostraste)
     */
    buildCommands(options: {
        absolute?: string;
        segments?: string[];
        params?: Record<string, any>;
        usePathRoute?: boolean;
    }): any[] {
        const commands: any[] = [];

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
    getCurrentRoute(): any {
        // Devuelve lo que necesite tu sistema para relativeTo
        return this.currentRoute ? this.createRelativeToReference(this.currentRoute) : null;
    }

    omDestroyd(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

}