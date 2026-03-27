import { Module } from "@om/modules/module.decorator";
import { OmTemplateProviders } from "./template.provider";

// om-module.decorator.ts
@Module({
    providers: [OmTemplateProviders],

})
export class OmTemplateModule {
    constructor() {
        // Inicialización del módulo
        console.log('CoreModule initialized')
    }
}
