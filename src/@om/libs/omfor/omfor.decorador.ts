import { ProviderRegistry } from "@om/inyects/provider.registry";
import { IOmLib } from "../_interfaces/iolibs";

import { OmForProviders } from "./omfor.provider";



export function omFor(config: IOmLib, context?: any): ClassDecorator {
    return (target) => {

        const parent = context

        const modules = parent.imports || []



        let isActiveModue = false
        for (const element of modules) {

            if (element.name === "OmForModule") {
                isActiveModue = true


            }
        }



        const provider = ProviderRegistry.get(OmForProviders)

        provider.objectParent = parent
        provider.config = config
        if (typeof provider.omInit === "function") {
            provider.omInit()

        }

        return provider.objectData;
    };
}
