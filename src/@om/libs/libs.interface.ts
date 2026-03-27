// src/core/interfaces/on-init.interface.ts (NUEVO ARCHIVO)
export type type_proyect="om-if" | "om-template"|"om-route_outle"
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';


export interface IChildLib {
    id: string
    provider: OmLibProvider
    type:type_proyect
}
/**
 * Interfaz para el ciclo de vida OnInit
 * Similar a Angular's OnInit
 */
export interface OmLibProvider {
    id?: string
    pathPrevious: string
    path: string
    pathObjetivo: string
    objectData: any
    objectComponent: any
    objectParent: any
    classComponent: any
    config: any
    target: any
    child?: IChildLib[]
    parentLib?: OmLibProvider
    type?:type_proyect

    isLoding$?: BehaviorSubject<boolean>

    /**
     * Método llamado después de que Angular haya inicializado 
     * todas las propiedades data-bound del componente.
     */
    omDestroyd(): void;

    /**
     * Método llamado después de que Angular haya inicializado 
     * todas las propiedades data-bound del componente.
     */
    omInit(): void;

    reload(): void
    cargarDeps(): void

    iniciarAfterViewInit():void

    iniciarOmInit():void

    iniciarOmDestroyd():void

    iniciarOmChanged():void
}