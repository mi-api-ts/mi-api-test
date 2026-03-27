"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Input = Input;
// src/core/decorators/input.decorator.ts
function Input(alias) {
    return (target, propertyKey) => {
        const metadataKey = `input:${String(propertyKey)}`;
        Reflect.defineMetadata(metadataKey, {
            propertyName: propertyKey,
            alias: alias || propertyKey,
            isInput: true
        }, target.constructor);
        console.log(`🎯 @Input(): ${String(propertyKey)} ${alias ? `(alias: ${alias})` : ''}`);
    };
}
