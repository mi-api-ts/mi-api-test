import { Injectable } from "@om/inyects/injector";
import { OmLibProvider } from "@om/libs/libs.interface";
import { OmInit } from "./interfaces/on-init.interface";
import { BehaviorSubject, distinctUntilChanged, merge, Observable, Subject, takeUntil } from 'rxjs';

@Injectable({ providedIn: "unique" })
export class ChangeDetectorRef implements OmInit {
    private componentRef: any;
    private isDetached = false;
    private markedForCheck = false;

    objectLib: OmLibProvider = null

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    private _isLoading: BehaviorSubject<boolean> = new BehaviorSubject(
        false
    );

    constructor() {

    }


    omInit(): void {
        const loadingObservables = [this._isLoading, this.objectLib.isLoding$]

        const valor = merge(...loadingObservables).pipe(
            distinctUntilChanged()   // evita emitir true → true → false → false
        );

        valor.pipe(
            takeUntil(this._unsubscribeAll)
        ).subscribe((response) => {

            if(response===false)
            this.objectLib.reload()

            console.log("se requiere cambios")
        })


    }

    /**
     * Marca este componente y todos sus ancestros para verificación
     * en el próximo ciclo de detección de cambios
     */
    markForCheck(): void {
        if (this.isDetached) {
            console.warn('ChangeDetectorRef: Componente está detachado, markForCheck no tendrá efecto');
            return;
        }

        this.markedForCheck = true;
        ///this.objectComponent.reload()

        this._isLoading.next(true)


        // Marcar también al componente padre (si existe)
        if (this.componentRef && this.componentRef['__parent']) {
            const parentRef = this.componentRef['__parent'].changeDetectorRef;
            if (parentRef) {
                parentRef.markForCheck();
            }
        }

        // En Angular real, esto programa la verificación para el próximo ciclo
        console.log('ChangeDetectorRef: Componente marcado para verificación');
    }

    /**
     * Verifica este componente y sus hijos inmediatamente
     */
    detectChanges(): void {
        if (this.isDetached) {
            console.warn('ChangeDetectorRef: Componente está detachado, detectChanges no tendrá efecto');
            return;
        }

        if (this.componentRef) {
            this.executeChangeDetection();
        }
        console.log('ChangeDetectorRef: Detección de cambios ejecutada inmediatamente');
    }

    /**
     * Desconecta el componente del ciclo de detección de cambios
     */
    detach(): void {
        this.isDetached = true;
        this.markedForCheck = false;
        console.log('ChangeDetectorRef: Componente desconectado del ciclo de cambios');
    }

    /**
     * Vuelve a conectar el componente al ciclo de detección de cambios
     */
    reattach(): void {
        this.isDetached = false;
        console.log('ChangeDetectorRef: Componente reconectado al ciclo de cambios');
    }

    /**
     * Verifica si el componente está marcado para verificación
     */
    checkNoChanges(): void {
        if (this.markedForCheck) {
            console.warn('ChangeDetectorRef: Componente tiene cambios pendientes');
        } else {
            console.log('ChangeDetectorRef: No hay cambios pendientes');
        }
    }

    /**
     * Limpia el estado de marcado
     */
    clearMarkedForCheck(): void {
        this.markedForCheck = false;
    }

    /**
     * Verifica si está marcado para check
     */
    isMarkedForCheck(): boolean {
        return this.markedForCheck;
    }

    /**
     * Verifica si está detachado
     */
    isDetachedState(): boolean {
        return this.isDetached;
    }

    /**
     * Método interno para ejecutar la detección de cambios
     */
    private executeChangeDetection(): void {
        // Simular la detección de cambios
        if (this.componentRef['__runChangeDetection']) {
            this.componentRef['__runChangeDetection']();
        }

        // Actualizar vista (en Angular real actualiza el DOM)
        this.updateView();

        // Resetear estado después de verificación
        this.markedForCheck = false;
    }

    /**
     * Método interno para actualizar la vista
     */
    private updateView(): void {
        // En Angular real, esto actualizaría las bindings en el template
        if (this.componentRef['__updateView']) {
            this.componentRef['__updateView']();
        }
    }
}