import { ComponentRegistry } from "./components/component.registry";
import { Injectable } from "./inyects/injector";
import { OmLibProvider } from "./libs/libs.interface";
import { analyzeRouteHierarchy, HierarchyAnalysis, IDiscardHierarchy, INeewHierarchy, resolveRouteObservablesSync } from "./om_helpers";
import { OmUtils } from "./om_utils";
import { PreparedNavigation } from "./route/route.navigation";
import { Route } from "./route/route.types";
import {
    BehaviorSubject,
    Observable,
    filter,
    map,
    of,
    switchMap,
    take,
    tap,
    throwError,
} from 'rxjs';


@Injectable({ providedIn: "root" })
export class OmProviders {

    private rootClass: any
    private rootInstance: any
    routes: Route[] = []
    path: string = ""
    pathObjetivo: string = ""
    pathNext: string = ""
    private analizeRoute: HierarchyAnalysis

    private _hierarchys: BehaviorSubject<INeewHierarchy[]> = new BehaviorSubject([]);
    private _hierarchy: BehaviorSubject<INeewHierarchy> = new BehaviorSubject(
        null
    );



    constructor() {


    }




    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for hierarchys
     */
    get hierarchy$(): Observable<INeewHierarchy> {
        return this._hierarchy.asObservable();
    }

    /**
     * Getter for hierarchy
     */
    get hierarchys$(): Observable<INeewHierarchy[]> {
        return this._hierarchys.asObservable();
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------



    setComponent(component, _routes: Route[]) {
        this.rootClass = component
        this.routes = _routes



        const selector = ComponentRegistry.getSelectorFromClass(component)

        if (_routes.length > 0) {
            this.path = ""
            const _defaultRoute = _routes.find((x) => x.redirectTo)
            const analysis1 = analyzeRouteHierarchy(_routes, this.path, _defaultRoute.redirectTo);
            ///creamo  las nuevas rutas
            this.createHierarchys(analysis1.newHierarchy).subscribe()


            const templateDefault = ComponentRegistry.getTemplate(selector)

            const demo = OmUtils.compile(templateDefault, component)
            ///guardarJSONCompleto(demo, './datos/template.json')
            //Captura de evento glogal
            //console.log(demo)

        } else {


        }



    }

    startRouteOutle(provider: OmLibProvider) {


        if (typeof provider.omInit === "function") {
            provider.omInit()
        }


        return provider.objectData

    }

    startTemlate(provider: OmLibProvider) {

        provider.omInit()

        provider.iniciarAfterViewInit()


        return provider.objectData

    }

    captureNavigation(nav: PreparedNavigation) {

        return this._hierarchy.pipe(
            map((valor) => {

                const analysis1 = analyzeRouteHierarchy(this.routes, valor.path, nav.metadata.constructedUrl);
                return analysis1

            })
        )


    }

    nextNavigate(nav: PreparedNavigation) {

        const values = this._hierarchys.value

        const selectedRoute = values.find((ss) => ss.path === nav.metadata.constructedUrl) || null



        if (selectedRoute) {
            const sssss = resolveRouteObservablesSync(selectedRoute)
            console.log(sssss)
            const selector = ComponentRegistry.getSelectorFromClass(selectedRoute.component)

            const templateDefault = ComponentRegistry.getTemplate(selector)

            const demo = OmUtils.compile(templateDefault, selectedRoute.component)
        }



    }



    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------


    createHierarchy(new_value: INeewHierarchy) {

        return this.hierarchys$.pipe(
            take(1),
            tap((datas) => {
                console.log(datas, new_value)

                const values = [...datas, new_value]

                this._hierarchys.next(values)
            })
        )
    }
    createHierarchys(new_values: INeewHierarchy[]) {

        return this._hierarchys.pipe(
            take(1),
            tap((datas) => {
                for (const valor of new_values) {

                    datas.push(valor)


                }
                this._hierarchys.next(datas)

            })
        )
    }
    updateHierarchy(path: string, new_value: INeewHierarchy): Observable<INeewHierarchy> {

        return this._hierarchys.pipe(
            take(1),
            map((herarchys: INeewHierarchy[]) => {
                // Find the index of the updated movord
                const index = herarchys.findIndex(
                    (item) => item.path === path
                );

                // Update the movord
                herarchys[index] = new_value;

                // Update the movords
                this._hierarchys.next(herarchys);

                // Return the updated movord
                return new_value;
            }),
            switchMap((updatedHierarchy) =>
                this.hierarchy$.pipe(
                    take(1),
                    filter((item) => item && item.path === path),
                    tap(() => {
                        // Update the movordt if it's selected
                        this._hierarchy.next(updatedHierarchy);

                        // Return the updated movordt
                        return updatedHierarchy;
                    })
                )
            )
        );
    }


    /**
     * Delete movord
     *
     * @param path
     */
    deleteHierarchy(hierarchy: IDiscardHierarchy) {
        return this.hierarchys$.pipe(
            take(1),
            tap((hierarchys) => {
                // Find the index of the deleted label within the movords
                const index = hierarchys.findIndex(
                    (item) => item.path === hierarchy.path
                );

                // Delete the movord
                hierarchys.splice(index, 1);

                // Update the movords
                this._hierarchys.next(hierarchys || []);

            })
        );
    }
    /**
     * Delete movord
     *
     * @param path
     */
    deleteHierarchys(_deleteHierarchy: IDiscardHierarchy[]) {
        return this.hierarchys$.pipe(
            take(1),
            tap((hierarchys) => {
                // Find the index of the deleted label within the movords

                for (const hierarchy of _deleteHierarchy) {

                    const index = hierarchys.findIndex(
                        (item) => item.path === hierarchy.path
                    );

                    // Delete the movord
                    hierarchys.splice(index, 1);


                }

                // Update the movords
                this._hierarchys.next(hierarchys || []);

            })
        );
    }
    /**
     * Get _hierarchy by path
     */
    getMovordById(path: string) {
        return this._hierarchys.pipe(
            take(1),
            map((hierarchys) => {
                // Find the movord
                const hierarchy = hierarchys.find((item) => item.path === path) || null;

                // Update the movord
                this._hierarchy.next(hierarchy);

                // Return the movord
                return hierarchy;
            }),
            switchMap((hierarchy) => {
                if (!hierarchy) {
                    return throwError(
                        'Could not found movord with id of ' + path + '!'
                    );
                }

                return of(hierarchy);
            })
        );
    }

    /**
     * Get _hierarchy by instance
     */
    getHierarchysByInstance(objectInstance: any) {
        return this._hierarchys.pipe(
            take(1),
            map((hierarchys) => {

                const hierarchy = hierarchys.find((x) => objectInstance instanceof x.component)

                // Return the movord
                return hierarchy;
            }),
            switchMap((hierarchy) =>
                this._hierarchy.pipe(
                    take(1),
                    filter((item) => !item || (item && item.path !== hierarchy.path)),
                    map(() => {
                        resolveRouteObservablesSync(hierarchy)

                        // Update the movord
                        this._hierarchy.next(hierarchy);

                        return hierarchy

                    })
                )
            )
        );
    }

    /**
     *
     * @returns
     */
    nextHierarchy(): Observable<INeewHierarchy> {

        return this.hierarchys$.pipe(
            take(1),
            switchMap((hierarchs) => this._hierarchy
                .pipe(
                    map((hierarch) => {
                        const indexPath = hierarchs.findIndex((x) => x.path === hierarch.path)
                        const siguientePath = hierarchs[indexPath + 1] || null
                        if (siguientePath) {
                            resolveRouteObservablesSync(siguientePath)
                            this._hierarchy.next(siguientePath);
                            return siguientePath
                        } else {
                            return null
                        }
                    }),
                )
            )
        )
    }
}
