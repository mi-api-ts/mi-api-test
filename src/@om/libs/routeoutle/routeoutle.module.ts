import { Module } from "@om/modules/module.decorator";
import { OmRouteOutleProviders } from "./routeoutle.provider";

// om-module.decorator.ts
@Module({
    providers: [  OmRouteOutleProviders],

})
export class OmRouteOutleModule {
    constructor() {
        // Inicialización del módulo
        console.log('CoreModule initialized')
    }
}
