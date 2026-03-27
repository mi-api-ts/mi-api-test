import { Params, UrlSegment, UrlSegmentGroup } from "./route.types";

export class UrlTree {
    // Propiedades principales
    root: UrlSegmentGroup;
    queryParams: Params;
    fragment: string | null;

    constructor(
        root: UrlSegmentGroup,
        queryParams: Params = {},
        fragment: string | null = null
    ) {
        this.root = root;
        this.queryParams = queryParams;
        this.fragment = fragment;
    }

    // ============ MÉTODOS PRINCIPALES ============

    toString(): string {
        const segmentString = this.serializeSegment(this.root);
        const queryString = this.serializeQueryParams();
        const fragmentString = this.fragment ? `#${this.fragment}` : '';

        return segmentString + queryString + fragmentString;
    }

    // Serializar segmentos de URL
    private serializeSegment(group: UrlSegmentGroup, prefix: string = ''): string {
        let result = '';

        // Segmentos principales
        if (group.segments.length > 0) {
            const segments = group.segments.map(seg => this.serializeSegmentWithParams(seg));
            result = prefix + '/' + segments.join('/');
        } else if (prefix === '') {
            result = '/';
        }

        // Segmentos hijos (outlets secundarios)
        Object.keys(group.children).forEach(outletName => {
            const childGroup = group.children[outletName];
            const childPrefix = `(${outletName}:`;
            const childResult = this.serializeSegment(childGroup, childPrefix);
            result += childResult.endsWith(')') ? childResult : childResult + ')';
        });

        return result;
    }

    private serializeSegmentWithParams(segment: UrlSegment): string {
        const paramKeys = Object.keys(segment.parameters);
        if (paramKeys.length === 0) {
            return segment.path;
        }

        const params = paramKeys
            .map(key => `${key}=${segment.parameters[key]}`)
            .join(';');

        return `${segment.path};${params}`;
    }

    private serializeQueryParams(): string {
        const keys = Object.keys(this.queryParams);
        if (keys.length === 0) {
            return '';
        }

        const params = keys
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(this.queryParams[key])}`)
            .join('&');

        return `?${params}`;
    }

    // ============ MÉTODOS DE MANIPULACIÓN ============

    // Crear un nuevo UrlTree a partir de una URL string
    static parse(url: string): UrlTree {
        const [pathPart, queryFragmentPart] = url.split('?');
        let queryPart = '';
        let fragmentPart = '';

        if (queryFragmentPart) {
            const [query, fragment] = queryFragmentPart.split('#');
            queryPart = query || '';
            fragmentPart = fragment || '';
        }

        // Parsear segmentos
        const root = this.parseSegments(pathPart);

        // Parsear query params
        const queryParams = this.parseQueryParams(queryPart);

        return new UrlTree(root, queryParams, fragmentPart || null);
    }

    private static parseSegments(url: string): UrlSegmentGroup {
        // Implementación simplificada de parsing
        const segments: UrlSegment[] = [];
        const children: { [key: string]: UrlSegmentGroup } = {};

        // Remover slash inicial
        let path = url.startsWith('/') ? url.substring(1) : url;

        if (path === '') {
            return {
                segments: [], children, parent: null,
                hasChildren: function (): boolean {
                    throw new Error("Function not implemented.");
                }
            };
        }

        // Separar segmentos principales de outlets secundarios
        const mainPathMatch = path.match(/^([^(]*)/);
        if (mainPathMatch) {
            const mainPath = mainPathMatch[1];
            if (mainPath) {
                segments.push(...this.parsePathSegments(mainPath));
            }
        }

        // Parsear outlets secundarios
        const outletMatches = path.matchAll(/\(([^:]+):([^)]+)\)/g);
        for (const match of outletMatches) {
            const outletName = match[1];
            const outletPath = match[2];
            children[outletName] = this.parseSegments(outletPath);
        }

        return {
            segments, children, parent: null,
            hasChildren: function (): boolean {
                throw new Error("Function not implemented.");
            }
        };
    }

    private static parsePathSegments(path: string): UrlSegment[] {
        return path.split('/')
            .filter(segment => segment.length > 0)
            .map(segment => {
                const [pathPart, ...paramParts] = segment.split(';');
                const parameters: { [key: string]: string } = {};

                paramParts.forEach(param => {
                    const [key, value] = param.split('=');
                    if (key && value) {
                        parameters[key] = value;
                    }
                });

                return { path: pathPart, parameters };
            });
    }

    private static parseQueryParams(queryString: string): Params {
        const params: Params = {};

        if (!queryString) {
            return params;
        }

        queryString.split('&').forEach(pair => {
            const [key, value] = pair.split('=');
            if (key) {
                params[decodeURIComponent(key)] = value ? decodeURIComponent(value) : '';
            }
        });

        return params;
    }

    // Obtener segmentos como array plano
    getAllSegments(): UrlSegment[] {
        const segments: UrlSegment[] = [];

        const collectSegments = (group: UrlSegmentGroup) => {
            segments.push(...group.segments);
            Object.values(group.children).forEach(collectSegments);
        };

        collectSegments(this.root);
        return segments;
    }

    // Obtener todos los parámetros (segmentos + query)
    getAllParams(): Params {
        const allParams: Params = { ...this.queryParams };

        const collectParams = (group: UrlSegmentGroup) => {
            group.segments.forEach(segment => {
                Object.assign(allParams, segment.parameters);
            });
            Object.values(group.children).forEach(collectParams);
        };

        collectParams(this.root);
        return allParams;
    }

    // Crear una copia modificada
    clone(): UrlTree {
        const cloneGroup = (group: UrlSegmentGroup): UrlSegmentGroup => {
            return {
                segments: group.segments.map(seg => ({
                    path: seg.path,
                    parameters: { ...seg.parameters }
                })),
                children: Object.keys(group.children).reduce((acc, key) => {
                    acc[key] = cloneGroup(group.children[key]);
                    return acc;
                }, {} as { [key: string]: UrlSegmentGroup; }),
                parent: null,
                hasChildren: function (): boolean {
                    throw new Error("Function not implemented.");
                }
            };
        };

        return new UrlTree(
            cloneGroup(this.root),
            { ...this.queryParams },
            this.fragment
        );
    }

    // Modificar query params
    withQueryParams(newQueryParams: Params): UrlTree {
        const tree = this.clone();
        tree.queryParams = { ...newQueryParams };
        return tree;
    }

    // Modificar fragmento
    withFragment(fragment: string | null): UrlTree {
        const tree = this.clone();
        tree.fragment = fragment;
        return tree;
    }

    // Modificar segmentos
    withSegment(path: string, parameters: Params = {}): UrlTree {
        const tree = this.clone();
        const segments = path.split('/').filter(s => s.length > 0);

        segments.forEach(segmentPath => {
            tree.root.segments.push({
                path: segmentPath,
                parameters: { ...parameters }
            });
        });

        return tree;
    }

    // Eliminar último segmento
    popSegment(): UrlTree {
        const tree = this.clone();
        if (tree.root.segments.length > 0) {
            tree.root.segments.pop();
        }
        return tree;
    }

    // Verificar si la URL contiene un path
    contains(path: string): boolean {
        const searchSegments = UrlTree.parseSegments(path).segments;
        const currentSegments = this.root.segments;

        if (searchSegments.length > currentSegments.length) {
            return false;
        }

        for (let i = 0; i < searchSegments.length; i++) {
            if (searchSegments[i].path !== currentSegments[i].path) {
                return false;
            }
        }

        return true;
    }

    // Obtener path relativo
    getRelativePath(base: UrlTree): string {
        const baseSegments = base.root.segments;
        const currentSegments = this.root.segments;

        let commonLength = 0;
        while (commonLength < baseSegments.length &&
            commonLength < currentSegments.length &&
            baseSegments[commonLength].path === currentSegments[commonLength].path) {
            commonLength++;
        }

        const upSteps = baseSegments.length - commonLength;
        const remainingSegments = currentSegments.slice(commonLength);

        const upPath = upSteps > 0 ? '../'.repeat(upSteps) : '';
        const remainingPath = remainingSegments.map(s => s.path).join('/');

        return upPath + remainingPath;
    }

    // Comparar con otra UrlTree
    equals(other: UrlTree): boolean {
        return this.toString() === other.toString();
    }

    // Obtener representación JSON
    toJSON(): any {
        return {
            root: this.serializeGroupToJSON(this.root),
            queryParams: this.queryParams,
            fragment: this.fragment,
            url: this.toString()
        };
    }

    private serializeGroupToJSON(group: UrlSegmentGroup): any {
        return {
            segments: group.segments.map(seg => ({
                path: seg.path,
                parameters: seg.parameters
            })),
            children: Object.keys(group.children).reduce((acc, key) => {
                acc[key] = this.serializeGroupToJSON(group.children[key]);
                return acc;
            }, {} as any)
        };
    }

    // ============ MÉTODOS ESTÁTICOS ADICIONALES ============

    // Crear desde objeto
    static fromJSON(json: any): UrlTree {
        const parseGroupFromJSON = (obj: any): UrlSegmentGroup => {
            return {
                segments: (obj.segments || []).map((s: any) => ({
                    path: s.path,
                    parameters: s.parameters || {}
                })),
                children: Object.keys(obj.children || {}).reduce((acc, key) => {
                    acc[key] = parseGroupFromJSON(obj.children[key]);
                    return acc;
                }, {} as { [key: string]: UrlSegmentGroup; }),
                parent: null,
                hasChildren: function (): boolean {
                    throw new Error("Function not implemented.");
                }
            };
        };

        return new UrlTree(
            parseGroupFromJSON(json.root || {}),
            json.queryParams || {},
            json.fragment || null
        );
    }

    // Crear URL absoluta
    toAbsoluteUrl(baseUrl: string): string {
        const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        const path = this.toString().startsWith('/') ? this.toString() : '/' + this.toString();
        return base + path;
    }

    // Extraer nombre del archivo si es una ruta de archivo
    getFilename(): string | null {
        const segments = this.root.segments;
        if (segments.length === 0) {
            return null;
        }

        const lastSegment = segments[segments.length - 1];
        const hasExtension = /\.\w+$/.test(lastSegment.path);

        return hasExtension ? lastSegment.path : null;
    }

    // Verificar si es una URL de API
    isApiUrl(): boolean {
        const segments = this.root.segments;
        return segments.length > 0 && segments[0].path === 'api';
    }

    // Obtener versión de API si es una URL de API
    getApiVersion(): string | null {
        if (!this.isApiUrl()) {
            return null;
        }

        const segments = this.root.segments;
        if (segments.length > 1 && segments[1].path.startsWith('v')) {
            return segments[1].path.substring(1);
        }

        return null;
    }
}
