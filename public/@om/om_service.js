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
exports.OmProviders = void 0;
const component_registry_1 = require("./components/component.registry");
const injector_1 = require("./inyects/injector");
const om_helpers_1 = require("./om_helpers");
const om_utils_1 = require("./om_utils");
const rxjs_1 = require("rxjs");
let OmProviders = class OmProviders {
    constructor() {
        this.routes = [];
        this.path = "";
        this.pathObjetivo = "";
        this.pathNext = "";
        this._hierarchys = new rxjs_1.BehaviorSubject([]);
        this._hierarchy = new rxjs_1.BehaviorSubject(null);
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------
    /**
     * Getter for hierarchys
     */
    get hierarchy$() {
        return this._hierarchy.asObservable();
    }
    /**
     * Getter for hierarchy
     */
    get hierarchys$() {
        return this._hierarchys.asObservable();
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------
    setComponent(component, _routes) {
        this.rootClass = component;
        this.routes = _routes;
        const selector = component_registry_1.ComponentRegistry.getSelectorFromClass(component);
        if (_routes.length > 0) {
            this.path = "";
            const _defaultRoute = _routes.find((x) => x.redirectTo);
            const analysis1 = (0, om_helpers_1.analyzeRouteHierarchy)(_routes, this.path, _defaultRoute.redirectTo);
            ///creamo  las nuevas rutas
            this.createHierarchys(analysis1.newHierarchy).subscribe();
            const templateDefault = component_registry_1.ComponentRegistry.getTemplate(selector);
            const demo = om_utils_1.OmUtils.compile(templateDefault, component);
            ///guardarJSONCompleto(demo, './datos/template.json')
            //Captura de evento glogal
            //console.log(demo)
        }
        else {
        }
    }
    startRouteOutle(provider) {
        if (typeof provider.omInit === "function") {
            provider.omInit();
        }
        return provider.objectData;
    }
    startTemlate(provider) {
        provider.omInit();
        provider.iniciarAfterViewInit();
        return provider.objectData;
    }
    captureNavigation(nav) {
        return this._hierarchy.pipe((0, rxjs_1.map)((valor) => {
            const analysis1 = (0, om_helpers_1.analyzeRouteHierarchy)(this.routes, valor.path, nav.metadata.constructedUrl);
            return analysis1;
        }));
    }
    nextNavigate(nav) {
        const values = this._hierarchys.value;
        const selectedRoute = values.find((ss) => ss.path === nav.metadata.constructedUrl) || null;
        if (selectedRoute) {
            const sssss = (0, om_helpers_1.resolveRouteObservablesSync)(selectedRoute);
            console.log(sssss);
            const selector = component_registry_1.ComponentRegistry.getSelectorFromClass(selectedRoute.component);
            const templateDefault = component_registry_1.ComponentRegistry.getTemplate(selector);
            const demo = om_utils_1.OmUtils.compile(templateDefault, selectedRoute.component);
        }
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------
    createHierarchy(new_value) {
        return this.hierarchys$.pipe((0, rxjs_1.take)(1), (0, rxjs_1.tap)((datas) => {
            console.log(datas, new_value);
            const values = [...datas, new_value];
            this._hierarchys.next(values);
        }));
    }
    createHierarchys(new_values) {
        return this._hierarchys.pipe((0, rxjs_1.take)(1), (0, rxjs_1.tap)((datas) => {
            for (const valor of new_values) {
                datas.push(valor);
            }
            this._hierarchys.next(datas);
        }));
    }
    updateHierarchy(path, new_value) {
        return this._hierarchys.pipe((0, rxjs_1.take)(1), (0, rxjs_1.map)((herarchys) => {
            // Find the index of the updated movord
            const index = herarchys.findIndex((item) => item.path === path);
            // Update the movord
            herarchys[index] = new_value;
            // Update the movords
            this._hierarchys.next(herarchys);
            // Return the updated movord
            return new_value;
        }), (0, rxjs_1.switchMap)((updatedHierarchy) => this.hierarchy$.pipe((0, rxjs_1.take)(1), (0, rxjs_1.filter)((item) => item && item.path === path), (0, rxjs_1.tap)(() => {
            // Update the movordt if it's selected
            this._hierarchy.next(updatedHierarchy);
            // Return the updated movordt
            return updatedHierarchy;
        }))));
    }
    /**
     * Delete movord
     *
     * @param path
     */
    deleteHierarchy(hierarchy) {
        return this.hierarchys$.pipe((0, rxjs_1.take)(1), (0, rxjs_1.tap)((hierarchys) => {
            // Find the index of the deleted label within the movords
            const index = hierarchys.findIndex((item) => item.path === hierarchy.path);
            // Delete the movord
            hierarchys.splice(index, 1);
            // Update the movords
            this._hierarchys.next(hierarchys || []);
        }));
    }
    /**
     * Delete movord
     *
     * @param path
     */
    deleteHierarchys(_deleteHierarchy) {
        return this.hierarchys$.pipe((0, rxjs_1.take)(1), (0, rxjs_1.tap)((hierarchys) => {
            // Find the index of the deleted label within the movords
            for (const hierarchy of _deleteHierarchy) {
                const index = hierarchys.findIndex((item) => item.path === hierarchy.path);
                // Delete the movord
                hierarchys.splice(index, 1);
            }
            // Update the movords
            this._hierarchys.next(hierarchys || []);
        }));
    }
    /**
     * Get _hierarchy by path
     */
    getMovordById(path) {
        return this._hierarchys.pipe((0, rxjs_1.take)(1), (0, rxjs_1.map)((hierarchys) => {
            // Find the movord
            const hierarchy = hierarchys.find((item) => item.path === path) || null;
            // Update the movord
            this._hierarchy.next(hierarchy);
            // Return the movord
            return hierarchy;
        }), (0, rxjs_1.switchMap)((hierarchy) => {
            if (!hierarchy) {
                return (0, rxjs_1.throwError)('Could not found movord with id of ' + path + '!');
            }
            return (0, rxjs_1.of)(hierarchy);
        }));
    }
    /**
     * Get _hierarchy by instance
     */
    getHierarchysByInstance(objectInstance) {
        return this._hierarchys.pipe((0, rxjs_1.take)(1), (0, rxjs_1.map)((hierarchys) => {
            const hierarchy = hierarchys.find((x) => objectInstance instanceof x.component);
            // Return the movord
            return hierarchy;
        }), (0, rxjs_1.switchMap)((hierarchy) => this._hierarchy.pipe((0, rxjs_1.take)(1), (0, rxjs_1.filter)((item) => !item || (item && item.path !== hierarchy.path)), (0, rxjs_1.map)(() => {
            (0, om_helpers_1.resolveRouteObservablesSync)(hierarchy);
            // Update the movord
            this._hierarchy.next(hierarchy);
            return hierarchy;
        }))));
    }
    /**
     *
     * @returns
     */
    nextHierarchy() {
        return this.hierarchys$.pipe((0, rxjs_1.take)(1), (0, rxjs_1.switchMap)((hierarchs) => this._hierarchy
            .pipe((0, rxjs_1.map)((hierarch) => {
            const indexPath = hierarchs.findIndex((x) => x.path === hierarch.path);
            const siguientePath = hierarchs[indexPath + 1] || null;
            if (siguientePath) {
                (0, om_helpers_1.resolveRouteObservablesSync)(siguientePath);
                this._hierarchy.next(siguientePath);
                return siguientePath;
            }
            else {
                return null;
            }
        }))));
    }
};
exports.OmProviders = OmProviders;
exports.OmProviders = OmProviders = __decorate([
    (0, injector_1.Injectable)({ providedIn: "root" }),
    __metadata("design:paramtypes", [])
], OmProviders);
//# sourceMappingURL=om_service.js.map