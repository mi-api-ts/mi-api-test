import { Module } from "@om/modules/module.decorator";
import { OmIfProviders } from "./omif.provider";
import { OmUtils } from "@om/om_utils";


// om-module.decorator.ts
@Module({
    providers: [OmUtils,  OmIfProviders],

})
export class OmIfModule {
    constructor() {
        // Inicialización del módulo
        console.log('CoreModule initialized')
    }
}
