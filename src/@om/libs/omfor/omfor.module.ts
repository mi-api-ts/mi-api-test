import { Module } from "@om/modules/module.decorator";
import { OmForProviders } from "./omfor.provider";
import { OmUtils } from "@om/om_utils";


// om-module.decorator.ts
@Module({
    providers: [OmUtils,  OmForProviders],

})
export class OmForModule {
    constructor() {
        // Inicialización del módulo
        console.log('CoreModule initialized')
    }
}
