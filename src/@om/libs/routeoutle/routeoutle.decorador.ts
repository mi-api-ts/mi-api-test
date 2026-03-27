import { IOmLib } from "../_interfaces/iolibs";

import { OmRouteOutleProviders } from "./routeoutle.provider";
import { OmProviders } from "@om/om_service";
import { generarUID } from "@om/om_helpers";
import { OmLibProvider } from "../libs.interface";
import { ProviderRegistry } from "@om/inyects/provider.registry";



export function omRouteOutle(config: IOmLib, classComponent: any, parentLib?: OmLibProvider): ClassDecorator {
    return (target) => {
        const id = generarUID()
        const provider = ProviderRegistry.get(OmRouteOutleProviders)

        provider.id = id
        provider.parentLib = parentLib
        provider.classComponent = classComponent
        provider.config = config
        provider.target = target
        const service = ProviderRegistry.get(OmProviders)

        return service.startRouteOutle(provider)
    };
}
