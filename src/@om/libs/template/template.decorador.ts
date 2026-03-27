import { ComponentRegistry } from "@om/components/component.registry";
import { IOmLib } from "../_interfaces/iolibs";

import { OmTemplateProviders } from "./template.provider";
import { OmLibProvider } from "../libs.interface";
import { generarUID } from "@om/om_helpers";
import { OmProviders } from "@om/om_service";
import { ProviderRegistry } from "@om/inyects/provider.registry";

export function omTemplate(config: IOmLib, context?: any, parentLib?: OmLibProvider): ClassDecorator {
    return (target) => {
        const id=generarUID()
        const parent = context

        const modules = parent.imports || []



        let isActiveModue = false
        for (const element of modules) {

            if (element.name === "OmTemplateModule") {
                isActiveModue = true
            }
        }

        const newInstance = ComponentRegistry.getMetadata(config.selector)

        if (!newInstance) {
            return null
        }

        const provider = ProviderRegistry.get(OmTemplateProviders)

        provider.target=target
        provider.objectParent = parent
        provider.config = config
        provider.parentLib=parentLib
        provider.id=id

        const service = ProviderRegistry.get(OmProviders)

        //const newInstance = ComponentRegistry.createComponent(config.selector)
        // const templateJson = ComponentRegistry.getTemplate(config.selector)

        return  service.startTemlate(provider)
    };
}
