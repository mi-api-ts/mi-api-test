import { Injectable } from '@om/inyects/injector'
import { IOmLib } from '../_interfaces/iolibs'
import { OmProviders } from '@om/om_service'
import { IChildLib, OmLibProvider, type_proyect } from '../libs.interface'
import { HierarchyAnalysis, INeewHierarchy } from '@om/om_helpers'
import { ComponentRegistry } from '@om/components/component.registry'
import { OmUtils } from '@om/om_utils'
import { detectViewChilds } from '../viewChild/viewChild'
import { findInJsonObject } from '../template/template.helpers'
import { ChangeDetectorRef } from '@om/components/change-detector-ref'
import { OmRouteNavigation } from '@om/route/route.navigation'
import { Subject, take, takeUntil } from 'rxjs'

@Injectable({ providedIn: 'unique', dependencies:[OmProviders] })
export class OmRouteOutleProviders implements OmLibProvider {
  pathPrevious: string
  path: string
  objectData: any = null
  objectParent: any
  config: IOmLib
  objectComponent: any
  pathObjetivo: string
  analizeRoute: HierarchyAnalysis
  nextRoute: INeewHierarchy
  pathRoute: INeewHierarchy
  classComponent: any
  target: any
  child: IChildLib[] = []
  parentLib?: OmLibProvider
  id: string
  type?: type_proyect = 'om-route_outle'
  private _unsubscribeAll: Subject<any> = new Subject<any>()

  constructor(private _service: OmProviders) {}

  cargarDeps(): void {
    ///Cargar dependencia para ChangeDetectorRef
    for (let item of this.objectComponent.providers) {
      if (item instanceof ChangeDetectorRef) {
        Object.assign(item, { objectLib: this })

        item.omInit()
      } else if (item instanceof OmRouteNavigation) {
        Object.assign(item, { pathRoute: this.pathRoute, objectLib: this })
        item.omInit()
      }
    }

    ///Cargar Dependencia para Decoradores de  ViewChild
    const viewChilds = detectViewChilds(this.objectComponent)

    for (const item of viewChilds) {
      const { selector, propertyKey } = item

      const demo = findInJsonObject(this.objectData, selector)

      if (demo) this.objectComponent[propertyKey] = demo?.parent || demo
    }
  }
  reload(): void {}

  omInit(): void {
    const selector = ComponentRegistry.getSelectorFromClass(this.classComponent)
    let parentInstance = ComponentRegistry.createComponent(selector)
    this.objectComponent = parentInstance

    if (this.parentLib) {
      this.parentLib.child.push({ id: this.id, type: 'om-route_outle', provider: this })
    }

    const template = ComponentRegistry.getTemplate(selector)

    //Capturamos el parentComponent
    if (this.parentLib) {
      this.objectParent = this.parentLib.objectParent
    }

    //CONTINUAMOS CON EL SCREIPT

    this._service
      .getHierarchysByInstance(parentInstance)
      .pipe(takeUntil(this._unsubscribeAll), take(1))
      .subscribe((response) => {
        this.pathRoute = response

        this.cargarDeps()
        this.iniciarOmInit()

        this._service.nextHierarchy().subscribe((sss) => {
          if (sss) {
            const _selector = ComponentRegistry.getSelectorFromClass(sss.component)
            const _template = ComponentRegistry.getTemplate(_selector)

            const response = OmUtils.render(_template, parentInstance)

            const templateChild = OmUtils.compile(response, sss.component, this)
            this._service.pathNext = sss.path
            this.objectData = templateChild
          }
        })
      })
  }

  omDestroyd(): void {
    this._unsubscribeAll.next(null)
    this._unsubscribeAll.complete()
  }

  startChild() {}

  iniciarAfterViewInit(): void {
    if (typeof this.objectComponent.omAfterViewInit === 'function') {
      this.objectComponent.omAfterViewInit()
    }
  }
  iniciarOmInit(): void {
    if (typeof this.objectComponent.omInit === 'function') {
      this.objectComponent.omInit()
    }
  }

  iniciarOmDestroyd(): void {
    if (typeof this.objectComponent.omDestroyd === 'function') {
      this.objectComponent.omDestroyd()
    }
  }
  iniciarOmChanged(): void {
    if (typeof this.objectComponent.omChanged === 'function') {
      this.objectComponent.omChanged()
    }
  }
}
