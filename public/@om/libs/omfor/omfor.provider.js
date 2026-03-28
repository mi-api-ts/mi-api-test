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
exports.OmForProviders = void 0;
const injector_1 = require("@om/inyects/injector");
const om_utils_1 = require("@om/om_utils");
let OmForProviders = class OmForProviders {
    constructor() {
        this.objectData = null;
    }
    omInit() {
        const inputData = om_utils_1.OmUtils.render(this.config.value, this.objectParent);
        const variablesInput = om_utils_1.OmUtils.extractVariables(inputData);
        // console.log(inputData)
        const listad = variablesInput.items || [];
        const vaaaa = listad.map((a) => {
            let _objeto = {};
            _objeto[variablesInput.item] = a;
            const result = variablesInput.template.map((c) => {
                const daaaa = om_utils_1.OmUtils.render(c, _objeto);
                return daaaa;
            });
            const demooo = result[0];
            return demooo;
        });
        this.objectData = vaaaa;
    }
};
exports.OmForProviders = OmForProviders;
exports.OmForProviders = OmForProviders = __decorate([
    (0, injector_1.Injectable)({ providedIn: "unique" }),
    __metadata("design:paramtypes", [])
], OmForProviders);
//# sourceMappingURL=omfor.provider.js.map