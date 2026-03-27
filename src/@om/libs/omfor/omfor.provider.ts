import { OmInit } from "@om/components/interfaces/on-init.interface";
import { Injectable } from "@om/inyects/injector";
import { IOmLib } from "../_interfaces/iolibs";
import { OmProviders } from "@om/om_service";
import { OmUtils } from "@om/om_utils";


@Injectable({ providedIn: "unique" })
export class OmForProviders implements OmInit {

    objectData: any = null
    objectParent: any
    config: IOmLib
    objectComponent: any

    constructor() {


    }

    omInit(): void {



        const inputData = OmUtils.render(this.config.value, this.objectParent)
        const variablesInput = OmUtils.extractVariables(inputData);

        // console.log(inputData)

        const listad = variablesInput.items || []

        const vaaaa = listad.map((a) => {
            let _objeto = {}

            _objeto[variablesInput.item] = a

            const result: any = variablesInput.template.map((c) => {
                const daaaa: any = OmUtils.render(c, _objeto)

                return daaaa
            })


            const demooo = result[0]

            return demooo


        })
        this.objectData = vaaaa


    }



}