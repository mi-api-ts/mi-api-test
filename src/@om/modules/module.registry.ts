// src/core/module.registry.ts
export class ModuleRegistry {
    private static modules = new Map<string, {
      moduleClass: any;
      declarations: any[];
      providers: any[];
    }>();
  
    /**
     * Registrar un módulo
     */
    static register(
        moduleName: string,
        moduleClass: any,
        declarations: any[] = [],
        providers: any[] = []
      ): void {
        if (this.modules.has(moduleName)) {
          console.log(`⚠️ Módulo ya registrado: ${moduleName} (omitido)`);
          return;
        }
        
        this.modules.set(moduleName, {
          moduleClass,
          declarations,
          providers
        });
        console.log(`📁 Módulo registrado: ${moduleName}`);
      }
  
    /**
     * Obtener módulo por nombre
     */
    static get(moduleName: string): any {
      const moduleInfo = this.modules.get(moduleName);
      if (!moduleInfo) {
        throw new Error(`Módulo no encontrado: ${moduleName}`);
      }
      return moduleInfo;
    }
  
    /**
     * Verificar si un módulo está registrado
     */
    static has(moduleName: string): boolean {
      return this.modules.has(moduleName);
    }
  
    /**
     * Obtener todos los módulos registrados
     */
    static getAll(): string[] {
      return Array.from(this.modules.keys());
    }
  
    /**
     * Inicializar un módulo (registrar sus componentes y proveedores)
     */
    static initialize(moduleName: string): void {
      const moduleInfo = this.get(moduleName);
      console.log(`🚀 Inicializando módulo: ${moduleName}`);
  
      // Registrar proveedores del módulo
      moduleInfo.providers.forEach((provider: any) => {
        const { ProviderRegistry } = require('./provider.registry');
        ProviderRegistry.register(provider);
        console.log(`   📦 Proveedor: ${provider.name}`);
      });
  
      // Registrar componentes del módulo
      moduleInfo.declarations.forEach((component: any) => {
        const { ComponentRegistry } = require('./component.registry');
        const selector = Reflect.getMetadata('component:selector', component);
        if (selector) {
          ComponentRegistry.register(selector, component);
          console.log(`   🎯 Componente: ${selector}`);
        }
      });
    }
  
    /**
     * Limpiar registro
     */
    static clear(): void {
      this.modules.clear();
      console.log('🧹 ModuleRegistry limpiado');
    }
  }