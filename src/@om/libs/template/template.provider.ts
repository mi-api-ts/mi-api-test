import { Injectable } from "@om/inyects/injector";
import { IOmLib } from "../_interfaces/iolibs";
import { ComponentRegistry } from "@om/components/component.registry";
import { OmUtils } from "@om/om_utils";
import { detectViewChilds } from "../viewChild/viewChild";
import { findInJsonObject } from "./template.helpers";
import { ChangeDetectorRef } from "@om/components/change-detector-ref";
import { IChildLib, OmLibProvider, type_proyect } from "../libs.interface";
import { MonitorSubscribe } from "@om/om_eventos";
import { BehaviorSubject, distinctUntilChanged, merge } from 'rxjs';


@Injectable({ providedIn: "unique" })
export class OmTemplateProviders implements OmLibProvider {

    objectData: any
    objectParent: any
    config: IOmLib
    objectComponent: any
    pathPrevious: string;
    path: string;
    pathObjetivo: string;
    classComponent: any;
    target: any;
    child: IChildLib[] = []
    parentLib?: OmLibProvider
    id: string
    isChanged = false
    type?: type_proyect;

    private _isLoading: BehaviorSubject<boolean> = new BehaviorSubject(false)

    constructor() {


    }

    get isLoding$() {
        return this._isLoading
    }




    omDestroyd(): void {

        if (typeof this.objectComponent.onDestroyd === "function") {
            this.objectComponent.onDestroyd()
            //  this.objectComponent = null
        }

    }

    omInit(): void {

        this.startChild()

    }

    startChild() {
        let newInstance = ComponentRegistry.createComponent(this.config.selector)
        this.objectComponent = newInstance

        if (this.parentLib) {
            this.parentLib.child.push({ id: this.id, type: "om-template", provider: this })
        }

        this.iniciarOmInit()

        MonitorSubscribe.monitorearInstancia(newInstance, newInstance.selector, {
            onEvent: (event) => {
                if (event.type === "method_end") {
                    this._isLoading.next(false)

                }

            },
            logToConsole: false // Desactivamos console.log para mostrar solo los eventos
        });

        this.isChanged = true
        this.reload()





    }


    iniciarAfterViewInit(): void {
        if (typeof this.objectComponent.omAfterViewInit === "function") {
            this.objectComponent.omAfterViewInit()

        }
    }
    iniciarOmInit(): void {
        if (typeof this.objectComponent.omInit === "function") {
            this.objectComponent.omInit()

        }
    }

    iniciarOmDestroyd(): void {
        if (typeof this.objectComponent.omDestroyd === "function") {
            this.objectComponent.omDestroyd()

        }
    }
    iniciarOmChanged(): void {
        if (typeof this.objectComponent.omChanged === "function") {
            this.objectComponent.omChanged()

        }
    }

    reload() {

        const templateJson = ComponentRegistry.getTemplate(this.config.selector)
        ///aplica solo al modulo detectado
        const variables = OmUtils.extractVariables(this.config.value);

        ///Cargamos los valores desde el partent
        const valo = OmUtils.render(variables, this.objectParent)
        //Cargamos esas variables al componente nuevo
        this.objectComponent = OmUtils.loadToInstance(this.objectComponent, valo)
        ///console.log(this.objectComponent)
        //despues de cargar la renderizacion completa al componente recien se inicia el comoponente
        const _templateJson= OmUtils.render(templateJson, this.objectComponent)
        //console.log(variables,valo, this.objectParent)

        if (this.child.length === 0) {
            const _compoilar = OmUtils.compile(_templateJson, this.objectComponent, this)
            this.objectData = _compoilar


        } else {
            for (const item of this.child) {

                item.provider.reload()

            }

        }


        //Insertamos variables exerno al nuevo instancia

        //console.log("varLimpio", variables)
        //OmUtils.loadToInstance(this.objectParent, variables)


        //const response = OmUtils.render(variables, this.objectComponent)


        this.iniciarAfterViewInit()

        ///recien renderizamos el template recientemente creado
        //  this.objectData = OmUtils.compile(response, this.objectComponent)

    }

    replica() {

        if (this.child.length > 0) {
            for (const item of this.child) {

                //item.provider.reload()

            }


        } else {
            const templateJson = ComponentRegistry.getTemplate(this.config.selector)
            const _compoilar = OmUtils.compile(templateJson, this.objectComponent, this)
            this.objectData = _compoilar

        }





    }

    cargarDeps(): void {
        ///Cargar dependencia para ChangeDetectorRef


        for (let item of this.objectComponent.providers) {

            if (item instanceof ChangeDetectorRef) {

                Object.assign(item, { "objectLib": this })
                item.omInit()

            }

        }


        ///Cargar Dependencia para Decoradores de  ViewChild
        const viewChilds = detectViewChilds(this.objectComponent);

        for (const item of viewChilds) {

            const { selector, propertyKey } = item

            const demo = findInJsonObject(this.objectData, selector)

            if (demo)
                this.objectComponent[propertyKey] = demo?.parent || demo
        }

    }
}