"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewChild = ViewChild;
exports.detectViewChilds = detectViewChilds;
exports.injectViewChild = injectViewChild;
// DECORADOR @ViewChild - NO se ejecuta inmediatamente
function ViewChild(selector) {
    return (target, propertyKey) => {
        // 1. Guardar metadata en la CLASE (no en la propiedad)
        const metadataKey = `_viewchild_${String(propertyKey)}`;
        const metadata = {
            selector,
            propertyKey: String(propertyKey),
            marked: true,
            // Referencia a la clase donde está definido
            targetClass: target.constructor
        };
        // Guardar en metadata de la clase
        const existingMetadata = Reflect.getMetadata('_viewchildren', target.constructor) || [];
        existingMetadata.push(metadata);
        Reflect.defineMetadata('_viewchildren', existingMetadata, target.constructor);
        console.log(`🎯 @ViewChild MARCADO: ${selector} -> ${String(propertyKey)}`);
        // 2. IMPORTANTE: Retornar undefined - NO modificar la propiedad
        return undefined;
    };
}
// FUNCIÓN para DETECTAR @ViewChild en una instancia (ejecutar después)
function detectViewChilds(instance) {
    // Obtener metadata de la CLASE (no de la instancia)
    const metadata = Reflect.getMetadata('_viewchildren', instance.constructor) || [];
    console.log(`🔍 Detectando @ViewChild en ${instance.constructor.name}:`);
    metadata.forEach((item) => {
        console.log(`   - ${item.propertyKey} -> ${item.selector}`);
    });
    return metadata;
}
// FUNCIÓN para INYECTAR datos en @ViewChild detectado
function injectViewChild(instance, propertyKey, value) {
    // Asignar directamente a la propiedad
    instance[propertyKey] = value;
    console.log(`💉 Inyectado en ${instance.constructor.name}.${propertyKey}`);
}
