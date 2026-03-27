// DECORADOR @ViewChild - NO se ejecuta inmediatamente
export function ViewChild(selector: string): PropertyDecorator {
    return (target: any, propertyKey: string | symbol) => {
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
export function detectViewChilds(instance: any): Array<{
    selector: string;
    propertyKey: string;
    targetClass: any;
}> {
    // Obtener metadata de la CLASE (no de la instancia)
    const metadata = Reflect.getMetadata('_viewchildren', instance.constructor) || [];
    
    metadata.forEach((item: any) => {
        console.log(`   - ${item.propertyKey} -> ${item.selector}`);
    });
    
    return metadata;
}

// FUNCIÓN para INYECTAR datos en @ViewChild detectado
export function injectViewChild(instance: any, propertyKey: string, value: any): void {
    // Asignar directamente a la propiedad
    (instance as any)[propertyKey] = value;
    console.log(`💉 Inyectado en ${instance.constructor.name}.${propertyKey}`);
}