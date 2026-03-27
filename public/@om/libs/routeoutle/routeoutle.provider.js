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
exports.OmRouteOutleProviders = void 0;
const injector_1 = require("@om/inyects/injector");
const om_service_1 = require("@om/om_service");
const component_registry_1 = require("@om/components/component.registry");
const om_utils_1 = require("@om/om_utils");
const viewChild_1 = require("../viewChild/viewChild");
const template_helpers_1 = require("../template/template.helpers");
const change_detector_ref_1 = require("@om/components/change-detector-ref");
const route_navigation_1 = require("@om/route/route.navigation");
const rxjs_1 = require("rxjs");
let OmRouteOutleProviders = class OmRouteOutleProviders {
    constructor(_service) {
        this._service = _service;
        this.objectData = null;
        this.child = [];
        this.type = 'om-route_outle';
        this._unsubscribeAll = new rxjs_1.Subject();
    }
    cargarDeps() {
        ///Cargar dependencia para ChangeDetectorRef
        for (let item of this.objectComponent.providers) {
            if (item instanceof change_detector_ref_1.ChangeDetectorRef) {
                Object.assign(item, { objectLib: this });
                item.omInit();
            }
            else if (item instanceof route_navigation_1.OmRouteNavigation) {
                Object.assign(item, { pathRoute: this.pathRoute, objectLib: this });
                item.omInit();
            }
        }
        ///Cargar Dependencia para Decoradores de  ViewChild
        const viewChilds = (0, viewChild_1.detectViewChilds)(this.objectComponent);
        for (const item of viewChilds) {
            const { selector, propertyKey } = item;
            const demo = (0, template_helpers_1.findInJsonObject)(this.objectData, selector);
            if (demo)
                this.objectComponent[propertyKey] = demo?.parent || demo;
        }
    }
    reload() { }
    omInit() {
        const selector = component_registry_1.ComponentRegistry.getSelectorFromClass(this.classComponent);
        let parentInstance = component_registry_1.ComponentRegistry.createComponent(selector);
        this.objectComponent = parentInstance;
        if (this.parentLib) {
            this.parentLib.child.push({ id: this.id, type: 'om-route_outle', provider: this });
        }
        const template = component_registry_1.ComponentRegistry.getTemplate(selector);
        //Capturamos el parentComponent
        if (this.parentLib) {
            this.objectParent = this.parentLib.objectParent;
        }
        //CONTINUAMOS CON EL SCREIPT
        this._service
            .getHierarchysByInstance(parentInstance)
            .pipe((0, rxjs_1.takeUntil)(this._unsubscribeAll), (0, rxjs_1.take)(1))
            .subscribe((response) => {
            this.pathRoute = response;
            this.cargarDeps();
            this.iniciarOmInit();
            this._service.nextHierarchy().subscribe((sss) => {
                if (sss) {
                    const _selector = component_registry_1.ComponentRegistry.getSelectorFromClass(sss.component);
                    const _template = component_registry_1.ComponentRegistry.getTemplate(_selector);
                    const response = om_utils_1.OmUtils.render(_template, parentInstance);
                    const templateChild = om_utils_1.OmUtils.compile(response, sss.component, this);
                    this._service.pathNext = sss.path;
                    this.objectData = templateChild;
                }
            });
        });
    }
    omDestroyd() {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
    startChild() { }
    iniciarAfterViewInit() {
        if (typeof this.objectComponent.omAfterViewInit === 'function') {
            this.objectComponent.omAfterViewInit();
        }
    }
    iniciarOmInit() {
        if (typeof this.objectComponent.omInit === 'function') {
            this.objectComponent.omInit();
        }
    }
    iniciarOmDestroyd() {
        if (typeof this.objectComponent.omDestroyd === 'function') {
            this.objectComponent.omDestroyd();
        }
    }
    iniciarOmChanged() {
        if (typeof this.objectComponent.omChanged === 'function') {
            this.objectComponent.omChanged();
        }
    }
};
exports.OmRouteOutleProviders = OmRouteOutleProviders;
exports.OmRouteOutleProviders = OmRouteOutleProviders = __decorate([
    (0, injector_1.Injectable)({ providedIn: 'unique', dependencies: [om_service_1.OmProviders] }),
    __metadata("design:paramtypes", [om_service_1.OmProviders])
], OmRouteOutleProviders);
