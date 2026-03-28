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
exports.OmTemplateModule = void 0;
const module_decorator_1 = require("@om/modules/module.decorator");
const template_provider_1 = require("./template.provider");
// om-module.decorator.ts
let OmTemplateModule = class OmTemplateModule {
    constructor() {
        // Inicialización del módulo
        console.log('CoreModule initialized');
    }
};
exports.OmTemplateModule = OmTemplateModule;
exports.OmTemplateModule = OmTemplateModule = __decorate([
    (0, module_decorator_1.Module)({
        providers: [template_provider_1.OmTemplateProviders],
    }),
    __metadata("design:paramtypes", [])
], OmTemplateModule);
//# sourceMappingURL=template.module.js.map