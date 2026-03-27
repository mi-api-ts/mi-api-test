import { IOmLib } from "../_interfaces/iolibs";

import { OmIfProviders } from "./omif.provider";
import { OmUtils } from "@om/om_utils";
import { generarUID } from "@om/om_helpers";
import { OmLibProvider } from "../libs.interface";
import { ProviderRegistry } from "@om/inyects/provider.registry";



export function omIf(config: IOmLib, context?: any, parentLib: OmLibProvider = null): ClassDecorator {
    return (target) => {
        const id=generarUID()
        const parent = context

        const modules = parent.imports || []



        let isActiveModue = false
        for (const element of modules) {

            if (element.name === "OmIfModule") {
                isActiveModue = true


            }
        }



        const provider = ProviderRegistry.get(OmIfProviders)

        const demo = OmUtils.extractVariables(config.value)
        provider.id=id
        provider.objectParent = parent
        provider.config = config
        provider.then=demo.then
        provider.else=demo.else
        provider.condition=demo.condition
        provider.parentLib=parentLib

        if (typeof provider.omInit === "function") {
            provider.omInit()

        }

        return provider.objectData;
    };
}
