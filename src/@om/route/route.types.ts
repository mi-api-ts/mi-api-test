import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { UrlTree } from './urltree';

// Definición de Type genérico
type Type<T = any> = new (...args: any[]) => T;

// Uso con interfaces específicas
type ComponentType = Type<any>;
type ServiceType = Type<any>;
type ModuleType = Type<any>;

type LoadChildren = LoadChildrenCallback | string;

// Uso: Puede ser un Resolver o datos directos
// Tipo para datos de resolución (resolvers)
type ResolveData = {
    [key: string | symbol]: any;
};

// Definición completa
type ResolveFn<T> = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => Observable<T> | Promise<T> | T;

// Callback para cargar módulos
type LoadChildrenCallback = () =>
    | Type<any>
    | NgModuleFactory<any>
    | Observable<Type<any> | NgModuleFactory<any> | DefaultExport<Type<any>>>
    | Promise<NgModuleFactory<any> | Type<any> | DefaultExport<Type<any>>>;

type NgModuleFactory<T> = GenericModuleFactory<T>;


interface GenericModuleFactory<T> {
    moduleType: Constructor<T>;
    create: (...args: any[]) => T;
}
type Constructor<T = any> = new (...args: any[]) => T;

// Para manejar default exports
interface DefaultExport<T> {
    default: T;
}


type UrlMatcher = (
    segments: UrlSegment[],
    segmentGroup: UrlSegmentGroup,
    route: Route
) => UrlMatchResult | null;

// Resultado del matching
interface UrlMatchResult {
    consumed: UrlSegment[];
    posParams?: { [name: string]: UrlSegment };
}
// Tipo para manejo de query parameters
type QueryParamsHandling = 'merge' | 'preserve' | '';

interface RouterStateSnapshot {
    // La URL completa como string
    url: string;

    // El árbol de rutas activas
    root: ActivatedRouteSnapshot;

    // Métodos útiles
    toString(): string;
}

export interface UrlSegmentGroup {
    // Segmentos de esta parte de la URL
    segments?: UrlSegment[];

    // Rutas hijas (por outlet name)
    children?: { [key: string]: UrlSegmentGroup };

    // Propiedad padre (solo para navegación interna)
    parent?: UrlSegmentGroup | null;

    // Obtener segmento específico
    hasChildren(): boolean;
}

export interface UrlSegment {
    // El path del segmento
    path: string;

    // Parámetros del segmento (matriz dinámica)
    parameters: { [name: string]: string };

    // Métodos
    toString(): string;
}
export interface Route {
    path?: string;
    pathMatch?: 'prefix' | 'full';
    component?: Type<any>;
    redirectTo?: string;
    outlet?: string;
    canActivate?: any[];
    canActivateChild?: any[];
    canDeactivate?: any[];
    canLoad?: any[];
    data?: Data;
    resolve?: ResolveData;
    children?: Routes;
    loadChildren?: LoadChildren;
    loadComponent?: any;
    matcher?: UrlMatcher;
    title?: string | Type<Resolve<string>> | ResolveFn<string>;
}

type Routes = Route[];

interface ActivatedRoute {
    // Propiedades
    url: Observable<UrlSegment[]>;
    params: Observable<Params>;
    queryParams: Observable<Params>;
    fragment: Observable<string | null>;
    data: Observable<Data>;
    outlet: string;
    component: Type<any> | null;

    // Propiedades de snapshot
    snapshot: ActivatedRouteSnapshot;

    // Métodos
    firstChild: ActivatedRoute | null;
    children: ActivatedRoute[];
    parent: ActivatedRoute | null;
    root: ActivatedRoute;
    pathFromRoot: ActivatedRoute[];
    paramMap: Observable<ParamMap>;
    queryParamMap: Observable<ParamMap>;
}

interface ActivatedRouteSnapshot {
    url: UrlSegment[];
    params: Params;
    queryParams: Params;
    fragment: string | null;
    data: Data;
    outlet: string;
    component: Type<any> | null;
    routeConfig: Route | null;
    root: ActivatedRouteSnapshot;
    parent: ActivatedRouteSnapshot | null;
    firstChild: ActivatedRouteSnapshot | null;
    children: ActivatedRouteSnapshot[];
    paramMap: ParamMap;
    queryParamMap: ParamMap;
}

interface CanActivate {
    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree;
}

interface CanActivateChild {
    canActivateChild(
        childRoute: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree;
}

interface CanDeactivate<T> {
    canDeactivate(
        component: T,
        currentRoute: ActivatedRouteSnapshot,
        currentState: RouterStateSnapshot,
        nextState?: RouterStateSnapshot
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree;
}

interface CanLoad {
    canLoad(
        route: Route,
        segments: UrlSegment[]
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree;
}

interface Resolve<T> {
    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<T> | Promise<T> | T;
}

interface NavigationExtras {
    skipLocationChange?: boolean;
    replaceUrl?: boolean;
    state?: { [k: string]: any };
    queryParams?: Params | null;
    fragment?: string;
    queryParamsHandling?: QueryParamsHandling | null;
    preserveFragment?: boolean;
    relativeTo?: ActivatedRoute | null;
}


// Para datos estáticos en rutas
type Data = {
    [key: string | symbol]: any;
};

// Para parámetros dinámicos
export type Params = {
    [key: string]: any;
};

interface ParamMap {
    has(name: string): boolean;
    get(name: string): string | null;
    getAll(name: string): string[];
    keys: string[];
}

// Mismo interface para queryParams
interface QueryParamMap extends ParamMap { }