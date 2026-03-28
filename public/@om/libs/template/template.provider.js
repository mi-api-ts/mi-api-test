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
exports.OmTemplateProviders = void 0;
const injector_1 = require("@om/inyects/injector");
const component_registry_1 = require("@om/components/component.registry");
const om_utils_1 = require("@om/om_utils");
const viewChild_1 = require("../viewChild/viewChild");
const template_helpers_1 = require("./template.helpers");
const change_detector_ref_1 = require("@om/components/change-detector-ref");
const om_eventos_1 = require("@om/om_eventos");
const rxjs_1 = require("rxjs");
let OmTemplateProviders = class OmTemplateProviders {
    constructor() {
        this.child = [];
        this.isChanged = false;
        this._isLoading = new rxjs_1.BehaviorSubject(false);
    }
    get isLoding$() {
        return this._isLoading;
    }
    omDestroyd() {
        if (typeof this.objectComponent.onDestroyd === "function") {
            this.objectComponent.onDestroyd();
            //  this.objectComponent = null
        }
    }
    omInit() {
        this.startChild();
    }
    startChild() {
        let newInstance = component_registry_1.ComponentRegistry.createComponent(this.config.selector);
        this.objectComponent = newInstance;
        if (this.parentLib) {
            this.parentLib.child.push({ id: this.id, type: "om-template", provider: this });
        }
        this.iniciarOmInit();
        om_eventos_1.MonitorSubscribe.monitorearInstancia(newInstance, newInstance.selector, {
            onEvent: (event) => {
                if (event.type === "method_end") {
                    this._isLoading.next(false);
                }
            },
            logToConsole: false // Desactivamos console.log para mostrar solo los eventos
        });
        this.isChanged = true;
        this.reload();
    }
    iniciarAfterViewInit() {
        if (typeof this.objectComponent.omAfterViewInit === "function") {
            this.objectComponent.omAfterViewInit();
        }
    }
    iniciarOmInit() {
        if (typeof this.objectComponent.omInit === "function") {
            this.objectComponent.omInit();
        }
    }
    iniciarOmDestroyd() {
        if (typeof this.objectComponent.omDestroyd === "function") {
            this.objectComponent.omDestroyd();
        }
    }
    iniciarOmChanged() {
        if (typeof this.objectComponent.omChanged === "function") {
            this.objectComponent.omChanged();
        }
    }
    reload() {
        const templateJson = component_registry_1.ComponentRegistry.getTemplate(this.config.selector);
        ///aplica solo al modulo detectado
        const variables = om_utils_1.OmUtils.extractVariables(this.config.value);
        ///Cargamos los valores desde el partent
        const valo = om_utils_1.OmUtils.render(variables, this.objectParent);
        //Cargamos esas variables al componente nuevo
        this.objectComponent = om_utils_1.OmUtils.loadToInstance(this.objectComponent, valo);
        ///console.log(this.objectComponent)
        //despues de cargar la renderizacion completa al componente recien se inicia el comoponente
        const _templateJson = om_utils_1.OmUtils.render(templateJson, this.objectComponent);
        //console.log(variables,valo, this.objectParent)
        if (this.child.length === 0) {
            const _compoilar = om_utils_1.OmUtils.compile(_templateJson, this.objectComponent, this);
            this.objectData = _compoilar;
        }
        else {
            for (const item of this.child) {
                item.provider.reload();
            }
        }
        //Insertamos variables exerno al nuevo instancia
        //console.log("varLimpio", variables)
        //OmUtils.loadToInstance(this.objectParent, variables)
        //const response = OmUtils.render(variables, this.objectComponent)
        this.iniciarAfterViewInit();
        ///recien renderizamos el template recientemente creado
        //  this.objectData = OmUtils.compile(response, this.objectComponent)
    }
    replica() {
        if (this.child.length > 0) {
            for (const item of this.child) {
                //item.provider.reload()
            }
        }
        else {
            const templateJson = component_registry_1.ComponentRegistry.getTemplate(this.config.selector);
            const _compoilar = om_utils_1.OmUtils.compile(templateJson, this.objectComponent, this);
            this.objectData = _compoilar;
        }
    }
    cargarDeps() {
        ///Cargar dependencia para ChangeDetectorRef
        for (let item of this.objectComponent.providers) {
            if (item instanceof change_detector_ref_1.ChangeDetectorRef) {
                Object.assign(item, { "objectLib": this });
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
};
exports.OmTemplateProviders = OmTemplateProviders;
exports.OmTemplateProviders = OmTemplateProviders = __decorate([
    (0, injector_1.Injectable)({ providedIn: "unique" }),
    __metadata("design:paramtypes", [])
], OmTemplateProviders);
//# sourceMappingURL=template.provider.js.map