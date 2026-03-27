// src/core/decorators/input.decorator.ts
export function Input(alias?: string): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        const metadataKey = `input:${String(propertyKey)}`;
        Reflect.defineMetadata(metadataKey, {
            propertyName: propertyKey,
            alias: alias || propertyKey,
            isInput: true
        }, target.constructor);
        
        console.log(`🎯 @Input(): ${String(propertyKey)} ${alias ? `(alias: ${alias})` : ''}`);
    };
}