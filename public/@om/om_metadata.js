"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleFile = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logger_1 = __importDefault(require("./logger"));
class ModuleFile {
    constructor() {
        this._root_component_class = null;
        this.logger = (0, logger_1.default)(this);
        console.log('ModuleFile initialized');
        // Iniciar carga automática en segundo plano
        ModuleFile.ensureMetadataLoaded();
    }
    /**
     * Inicialización automática del metadata (estático)
     */
    static async initializeMetadata() {
        if (this.initializationPromise) {
            return this.initializationPromise;
        }
        this.initializationPromise = (async () => {
            try {
                console.log('🔄 Cargando metadata.json automáticamente...');
                this.metadata = await this.loadMetadata();
                this.isInitialized = true;
                console.log('✅ Metadata cargado exitosamente');
                console.log(`📊 Total de elementos: ${Object.keys(this.metadata).length}`);
            }
            catch (error) {
                console.error('❌ Error en carga automática de metadata:', error);
                this.isInitialized = false;
                throw error;
            }
        })();
        return this.initializationPromise;
    }
    /**
     * Espera a que el metadata esté cargado (estático)
     */
    static async ensureMetadataLoaded() {
        if (!this.isInitialized) {
            await this.initializeMetadata();
        }
        if (!this.metadata) {
            throw new Error('Metadata no disponible');
        }
    }
    /**
     * Carga el archivo metadata.json desde assets (estático)
     */
    static async loadMetadataFile() {
        // Obtener la ruta correcta (después de compilación)
        const metadataPath = path_1.default.join(__dirname, 'metadata.json');
        // Leer el archivo
        try {
            const metadata = JSON.parse(fs_1.default.readFileSync(metadataPath, 'utf-8'));
            return metadata;
        }
        catch (error) {
            console.error('Error al leer metadata.json:', error);
        }
    }
    /**
     * Carga y cachea el metadata (estático)
     */
    static async loadMetadata() {
        const cacheKey = 'metadata';
        if (this.metadataCache.has(cacheKey)) {
            return this.metadataCache.get(cacheKey);
        }
        try {
            const metadata = await this.loadMetadataFile();
            this.metadataCache.set(cacheKey, metadata);
            return metadata;
        }
        catch (error) {
            console.error('❌ Error cargando metadata:', error);
            throw error;
        }
    }
    /**
     * Búsqueda por ruta de archivo exacta (estático)
     */
    static async findByFilePath(filePath) {
        await this.ensureMetadataLoaded();
        const normalizedSearchPath = this.normalizePath(filePath);
        const results = [];
        Object.keys(this.metadata).forEach(key => {
            const item = this.metadata[key];
            const normalizedItemPath = this.normalizePath(item.file);
            if (normalizedItemPath === normalizedSearchPath) {
                results.push({
                    key: key,
                    ...item
                });
            }
        });
        if (results.length === 0) {
            console.log(`🔍 No se encontró ningún elemento en la ruta: '${filePath}'`);
            return [];
        }
        console.log(`✅ Encontrado(s) ${results.length} elemento(s) en la ruta '${filePath}':`);
        results.forEach((result, index) => {
            console.log(`   ${index + 1}. ${result.key} (${result.type})`);
        });
        return results;
    }
    /**
     * Búsqueda por ruta de archivo que contenga el patrón (estático)
     */
    static async findByFilePathPattern(pattern) {
        await this.ensureMetadataLoaded();
        const normalizedPattern = this.normalizePath(pattern).toLowerCase();
        const results = [];
        Object.keys(this.metadata).forEach(key => {
            const item = this.metadata[key];
            const normalizedItemPath = this.normalizePath(item.file).toLowerCase();
            if (normalizedItemPath.includes(normalizedPattern)) {
                results.push({
                    key: key,
                    ...item
                });
            }
        });
        console.log(`🔍 Búsqueda por patrón '${pattern}': ${results.length} resultados`);
        return results;
    }
    /**
     * Búsqueda por nombre de clase exacto (estático)
     */
    static async findByClassName(className) {
        await this.ensureMetadataLoaded();
        const results = [];
        Object.keys(this.metadata).forEach(key => {
            const item = this.metadata[key];
            if (item.className === className) {
                results.push({
                    key: key,
                    ...item
                });
            }
        });
        if (results.length === 0) {
            console.log(`🔍 No se encontró ninguna clase con nombre: '${className}'`);
            return [];
        }
        console.log(`✅ Encontrado(s) ${results.length} elemento(s) con clase '${className}':`);
        return results;
    }
    /**
     * Búsqueda por nombre de clase que contenga el patrón (estático)
     */
    static async findByClassNamePattern(pattern) {
        await this.ensureMetadataLoaded();
        const results = [];
        Object.keys(this.metadata).forEach(key => {
            const item = this.metadata[key];
            if (item.className.toLowerCase().includes(pattern.toLowerCase())) {
                results.push({
                    key: key,
                    ...item
                });
            }
        });
        console.log(`🔍 Búsqueda por patrón de clase '${pattern}': ${results.length} resultados`);
        return results;
    }
    /**
     * Búsqueda por selector exacto (estático)
     */
    static async findBySelector(selector) {
        await this.ensureMetadataLoaded();
        const results = [];
        Object.keys(this.metadata).forEach(key => {
            const item = this.metadata[key];
            if (item.selector === selector) {
                results.push({
                    key: key,
                    ...item
                });
            }
        });
        if (results.length === 0) {
            console.log(`🔍 No se encontró ningún elemento con selector: '${selector}'`);
            return [];
        }
        console.log(`✅ Encontrado(s) ${results.length} elemento(s) con selector '${selector}':`);
        results.forEach((result, index) => {
            console.log(`   ${index + 1}. ${result.key} (${result.type})`);
        });
        return results;
    }
    /**
     * Búsqueda por selector que contenga el patrón (estático)
     */
    static async findBySelectorPattern(pattern) {
        await this.ensureMetadataLoaded();
        const results = [];
        Object.keys(this.metadata).forEach(key => {
            const item = this.metadata[key];
            if (item.selector.toLowerCase().includes(pattern.toLowerCase())) {
                results.push({
                    key: key,
                    ...item
                });
            }
        });
        console.log(`🔍 Búsqueda por patrón de selector '${pattern}': ${results.length} resultados`);
        return results;
    }
    /**
     * Búsqueda por tipo (component/injectable) (estático)
     */
    static async findByType(type) {
        await this.ensureMetadataLoaded();
        const results = Object.values(this.metadata).filter((item) => item.type === type);
        console.log(`📊 Elementos de tipo '${type}': ${results.length}`);
        return results;
    }
    /**
     * Búsqueda avanzada con múltiples criterios (estático)
     */
    static async advancedSearch(filters) {
        await this.ensureMetadataLoaded();
        const results = [];
        Object.keys(this.metadata).forEach(key => {
            const item = this.metadata[key];
            let matches = true;
            if (filters.className && item.className !== filters.className) {
                matches = false;
            }
            if (filters.selector && item.selector !== filters.selector) {
                matches = false;
            }
            if (filters.filePath) {
                const normalizedFilter = this.normalizePath(filters.filePath);
                const normalizedItem = this.normalizePath(item.file);
                if (normalizedItem !== normalizedFilter) {
                    matches = false;
                }
            }
            if (filters.type && item.type !== filters.type) {
                matches = false;
            }
            if (filters.category && item.category !== filters.category) {
                matches = false;
            }
            if (matches) {
                results.push({
                    key: key,
                    ...item
                });
            }
        });
        console.log(`🔍 Búsqueda avanzada: ${results.length} resultados`);
        return results;
    }
    /**
     * Obtiene todos los elementos del metadata (estático)
     */
    static async getAll() {
        await this.ensureMetadataLoaded();
        return Object.values(this.metadata);
    }
    /**
     * Obtiene estadísticas del metadata (estático)
     */
    static async getStats() {
        await this.ensureMetadataLoaded();
        const stats = {
            total: Object.keys(this.metadata).length,
            byType: {
                component: 0,
                injectable: 0
            },
            byCategory: {
                framework: 0,
                main: 0,
                shared: 0
            },
            files: new Set()
        };
        Object.values(this.metadata).forEach((item) => {
            stats.byType[item.type]++;
            stats.byCategory[item.category] = (stats.byCategory[item.category] || 0) + 1;
            stats.files.add(item.file);
        });
        return {
            ...stats,
            uniqueFiles: stats.files.size
        };
    }
    /**
     * Obtiene las dependencias de un elemento por su selector (estático)
     */
    static async getDependencies(selector) {
        const elements = await this.findBySelector(selector);
        if (elements.length === 0) {
            return [];
        }
        // Tomar el primer elemento encontrado
        const element = elements[0];
        return element.parameters || [];
    }
    /**
     * Normaliza rutas para comparación (estático)
     */
    static normalizePath(path) {
        return path
            .replace(/\\/g, '/')
            .replace(/\/+/g, '/')
            .replace(/\/$/, '');
    }
    /**
     * Métodos de compatibilidad (estáticos)
     */
    static async findComponentBySelector(selector) {
        const results = await this.findBySelector(selector);
        return results.length === 1 ? results[0] : results;
    }
    static async findComponentByClassName(className) {
        const results = await this.findByClassName(className);
        return results.length === 1 ? results[0] : results;
    }
    static async getAllComponents() {
        return this.findByType('component');
    }
    static async getAllInjectables() {
        return this.findByType('injectable');
    }
    static async findComponentsByType(type) {
        return this.findByType(type);
    }
    static async getComponentDependencies(selector) {
        return this.getDependencies(selector);
    }
    /**
     * Simula fs.existsSync (estático)
     */
    static async existsSync(filePath) {
        try {
            console.log("metadataPath", filePath);
            if (filePath.includes('metadata.json')) {
                const metadataPath = `${this.basePath}/metadata.json`;
                const response = await fetch(metadataPath, { method: 'HEAD' });
                return response.ok;
            }
            const response = await fetch(filePath, { method: 'HEAD' });
            return response.ok;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Simula path.dirname (estático)
     */
    static dirname(filePath) {
        return filePath.split('/').slice(0, -1).join('/') || '.';
    }
    /**
     * Simula path.resolve (estático)
     */
    static resolve(...paths) {
        const joinedPath = paths.join('/');
        return joinedPath.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
    }
    /**
     * Verifica si un archivo existe (estático)
     */
    static async fileExists(filePath) {
        return await this.existsSync(filePath);
    }
    /**
     * Métodos de instancia que delegan a los métodos estáticos
     */
    async findByFilePath(filePath) {
        return ModuleFile.findByFilePath(filePath);
    }
    async findByFilePathPattern(pattern) {
        return ModuleFile.findByFilePathPattern(pattern);
    }
    async findByClassName(className) {
        return ModuleFile.findByClassName(className);
    }
    async findByClassNamePattern(pattern) {
        return ModuleFile.findByClassNamePattern(pattern);
    }
    async findBySelector(selector) {
        return ModuleFile.findBySelector(selector);
    }
    async findBySelectorPattern(pattern) {
        return ModuleFile.findBySelectorPattern(pattern);
    }
    async findByType(type) {
        return ModuleFile.findByType(type);
    }
    async advancedSearch(filters) {
        return ModuleFile.advancedSearch(filters);
    }
    async getAll() {
        return ModuleFile.getAll();
    }
    async getStats() {
        return ModuleFile.getStats();
    }
    async getDependencies(selector) {
        return ModuleFile.getDependencies(selector);
    }
    async findComponentBySelector(selector) {
        return ModuleFile.findComponentBySelector(selector);
    }
    async findComponentByClassName(className) {
        return ModuleFile.findComponentByClassName(className);
    }
    async getAllComponents() {
        return ModuleFile.getAllComponents();
    }
    async getAllInjectables() {
        return ModuleFile.getAllInjectables();
    }
    async findComponentsByType(type) {
        return ModuleFile.findComponentsByType(type);
    }
    async getComponentDependencies(selector) {
        return ModuleFile.getComponentDependencies(selector);
    }
    async existsSync(filePath) {
        return ModuleFile.existsSync(filePath);
    }
    dirname(filePath) {
        return ModuleFile.dirname(filePath);
    }
    resolve(...paths) {
        return ModuleFile.resolve(...paths);
    }
    async fileExists(filePath) {
        return ModuleFile.fileExists(filePath);
    }
}
exports.ModuleFile = ModuleFile;
ModuleFile.metadataCache = new Map();
ModuleFile.basePath = 'out/main/@om';
ModuleFile.metadata = null;
ModuleFile.isInitialized = false;
ModuleFile.initializationPromise = null;
//# sourceMappingURL=om_metadata.js.map