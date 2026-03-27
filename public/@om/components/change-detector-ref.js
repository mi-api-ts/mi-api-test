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
exports.ChangeDetectorRef = void 0;
const injector_1 = require("@om/inyects/injector");
const rxjs_1 = require("rxjs");
let ChangeDetectorRef = class ChangeDetectorRef {
    constructor() {
        this.isDetached = false;
        this.markedForCheck = false;
        this.objectLib = null;
        this._unsubscribeAll = new rxjs_1.Subject();
        this._isLoading = new rxjs_1.BehaviorSubject(false);
    }
    omInit() {
        const loadingObservables = [this._isLoading, this.objectLib.isLoding$];
        const valor = (0, rxjs_1.merge)(...loadingObservables).pipe((0, rxjs_1.distinctUntilChanged)() // evita emitir true → true → false → false
        );
        valor.pipe((0, rxjs_1.takeUntil)(this._unsubscribeAll)).subscribe((response) => {
            if (response === false)
                this.objectLib.reload();
            console.log("se requiere cambios");
        });
    }
    /**
     * Marca este componente y todos sus ancestros para verificación
     * en el próximo ciclo de detección de cambios
     */
    markForCheck() {
        if (this.isDetached) {
            console.warn('ChangeDetectorRef: Componente está detachado, markForCheck no tendrá efecto');
            return;
        }
        this.markedForCheck = true;
        ///this.objectComponent.reload()
        this._isLoading.next(true);
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
    detectChanges() {
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
    detach() {
        this.isDetached = true;
        this.markedForCheck = false;
        console.log('ChangeDetectorRef: Componente desconectado del ciclo de cambios');
    }
    /**
     * Vuelve a conectar el componente al ciclo de detección de cambios
     */
    reattach() {
        this.isDetached = false;
        console.log('ChangeDetectorRef: Componente reconectado al ciclo de cambios');
    }
    /**
     * Verifica si el componente está marcado para verificación
     */
    checkNoChanges() {
        if (this.markedForCheck) {
            console.warn('ChangeDetectorRef: Componente tiene cambios pendientes');
        }
        else {
            console.log('ChangeDetectorRef: No hay cambios pendientes');
        }
    }
    /**
     * Limpia el estado de marcado
     */
    clearMarkedForCheck() {
        this.markedForCheck = false;
    }
    /**
     * Verifica si está marcado para check
     */
    isMarkedForCheck() {
        return this.markedForCheck;
    }
    /**
     * Verifica si está detachado
     */
    isDetachedState() {
        return this.isDetached;
    }
    /**
     * Método interno para ejecutar la detección de cambios
     */
    executeChangeDetection() {
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
    updateView() {
        // En Angular real, esto actualizaría las bindings en el template
        if (this.componentRef['__updateView']) {
            this.componentRef['__updateView']();
        }
    }
};
exports.ChangeDetectorRef = ChangeDetectorRef;
exports.ChangeDetectorRef = ChangeDetectorRef = __decorate([
    (0, injector_1.Injectable)({ providedIn: "unique" }),
    __metadata("design:paramtypes", [])
], ChangeDetectorRef);
