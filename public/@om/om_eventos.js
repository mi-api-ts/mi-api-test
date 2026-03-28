"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitorSubscribe = void 0;
const rxjs_1 = require("rxjs");
class MonitorSubscribe {
    /**
     * Monitorea una instancia específica
     */
    static monitorearInstancia(instancia, nombreClase, config) {
        const defaultConfig = {
            captureValues: true,
            captureErrors: true,
            logToConsole: true,
            ...config
        };
        // Registrar la instancia
        this.instanceMonitors.set(instancia, { className: nombreClase, config: defaultConfig });
        const proto = Object.getPrototypeOf(instancia);
        const metodos = Object.getOwnPropertyNames(proto).filter(name => name !== 'constructor' && typeof proto[name] === 'function');
        this.emitEvent({
            type: 'method_start',
            executionId: 0,
            className: nombreClase,
            methodName: 'monitorearInstancia',
            timestamp: Date.now(),
            data: { methodCount: metodos.length }
        });
        if (defaultConfig.logToConsole) {
            console.log(`🔍 Monitorizando ${metodos.length} métodos en ${nombreClase}`);
        }
        metodos.forEach(metodoNombre => {
            const metodoOriginal = proto[metodoNombre];
            proto[metodoNombre] = function (...args) {
                const instanceInfo = MonitorSubscribe.instanceMonitors.get(this);
                if (!instanceInfo) {
                    return metodoOriginal.apply(this, args);
                }
                if (MonitorSubscribe.monitoringActive) {
                    return metodoOriginal.apply(this, args);
                }
                MonitorSubscribe.monitoringActive = true;
                const executionId = ++MonitorSubscribe.executionCounter;
                try {
                    // Emitir evento de inicio
                    MonitorSubscribe.emitEvent({
                        type: 'method_start',
                        executionId,
                        className: instanceInfo.className,
                        methodName: metodoNombre,
                        timestamp: Date.now(),
                        data: { args }
                    });
                    if (instanceInfo.config.logToConsole) {
                        console.log(`🚀 [${executionId}] ${instanceInfo.className}.${metodoNombre}() iniciado`);
                    }
                    // Interceptar Observable solo para esta ejecución
                    const ObservableInterceptor = MonitorSubscribe.createObservableInterceptor(executionId, instanceInfo.className, metodoNombre, instanceInfo.config);
                    // Ejecutar método con Observable interceptado
                    return MonitorSubscribe.executeWithInterception(this, metodoOriginal, args, ObservableInterceptor, executionId, `${instanceInfo.className}.${metodoNombre}`, instanceInfo.config);
                }
                finally {
                    MonitorSubscribe.monitoringActive = false;
                    // Emitir evento de fin
                    MonitorSubscribe.emitEvent({
                        type: 'method_end',
                        executionId,
                        className: instanceInfo.className,
                        methodName: metodoNombre,
                        timestamp: Date.now()
                    });
                    if (instanceInfo.config.logToConsole) {
                        console.log(`🏁 [${executionId}] ${instanceInfo.className}.${metodoNombre}() finalizado`);
                    }
                }
            };
        });
    }
    /**
     * Suscribirse a eventos de una clase específica
     */
    static getMonitor(className, callback) {
        if (!this.eventListeners.has(className)) {
            this.eventListeners.set(className, []);
        }
        const listeners = this.eventListeners.get(className);
        listeners.push(callback);
        return {
            unsubscribe: () => {
                const index = listeners.indexOf(callback);
                if (index > -1) {
                    listeners.splice(index, 1);
                }
            }
        };
    }
    /**
     * Suscribirse a eventos de todas las clases
     */
    static getAllMonitors(callback) {
        const allListeners = [];
        // Agregar a todas las clases existentes
        this.eventListeners.forEach((listeners, className) => {
            listeners.push(callback);
            allListeners.push(callback);
        });
        // También escuchar nuevas clases
        const originalSet = this.eventListeners.set.bind(this.eventListeners);
        this.eventListeners.set = (key, value) => {
            const result = originalSet(key, value);
            if (Array.isArray(value)) {
                value.push(callback);
            }
            return result;
        };
        return {
            unsubscribe: () => {
                this.eventListeners.forEach((listeners) => {
                    const index = listeners.indexOf(callback);
                    if (index > -1) {
                        listeners.splice(index, 1);
                    }
                });
            }
        };
    }
    /**
     * Dejar de monitorear una instancia
     */
    static detenerMonitor(instancia) {
        const info = this.instanceMonitors.get(instancia);
        if (info) {
            this.emitEvent({
                type: 'unsubscribe',
                executionId: 0,
                className: info.className,
                methodName: 'detenerMonitor',
                timestamp: Date.now(),
                data: { instance: instancia.constructor.name }
            });
            this.instanceMonitors.delete(instancia);
        }
    }
    /**
     * Obtener estadísticas de monitoreo
     */
    static getStats() {
        const listeners = new Map();
        this.eventListeners.forEach((list, className) => {
            listeners.set(className, list.length);
        });
        return {
            monitoredInstances: this.instanceMonitors.size,
            totalEvents: this.executionCounter,
            listeners
        };
    }
    static emitEvent(event) {
        // Enviar al callback específico de la instancia si existe
        const targetInstance = Array.from(this.instanceMonitors.values())
            .find(info => info.className === event.className);
        if (targetInstance?.config.onEvent) {
            targetInstance.config.onEvent(event);
        }
        // Enviar a listeners específicos de la clase
        const classListeners = this.eventListeners.get(event.className);
        if (classListeners) {
            classListeners.forEach(callback => {
                try {
                    callback(event);
                }
                catch (err) {
                    console.error('Error en listener de monitoreo:', err);
                }
            });
        }
        // Enviar a listeners globales (si están registrados en todas las clases)
        if (this.eventListeners.has('*')) {
            const globalListeners = this.eventListeners.get('*');
            globalListeners.forEach(callback => {
                try {
                    callback(event);
                }
                catch (err) {
                    console.error('Error en listener global de monitoreo:', err);
                }
            });
        }
    }
    static createObservableInterceptor(executionId, className, methodName, config) {
        return class ObservableInterceptado extends rxjs_1.Observable {
            constructor(subscribeFn) {
                MonitorSubscribe.emitEvent({
                    type: 'observable_created',
                    executionId,
                    className,
                    methodName,
                    timestamp: Date.now()
                });
                if (config.logToConsole) {
                    console.log(`🎯 [${executionId}] Observable creado en ${className}.${methodName}`);
                }
                super((subscriber) => {
                    if (subscribeFn) {
                        const interceptedSubscriber = MonitorSubscribe.interceptSubscriber(subscriber, executionId, className, methodName, config);
                        return subscribeFn(interceptedSubscriber);
                    }
                    return undefined;
                });
            }
        };
    }
    static interceptSubscriber(originalSubscriber, executionId, className, methodName, config) {
        return {
            next: originalSubscriber.next ? (value) => {
                if (config.captureValues) {
                    MonitorSubscribe.emitEvent({
                        type: 'next_value',
                        executionId,
                        className,
                        methodName,
                        timestamp: Date.now(),
                        data: { value }
                    });
                }
                if (config.logToConsole) {
                    console.log(`📥 [${executionId}] Observable emitió:`, value);
                }
                return originalSubscriber.next.call(originalSubscriber, value);
            } : undefined,
            error: originalSubscriber.error ? (err) => {
                if (config.captureErrors) {
                    MonitorSubscribe.emitEvent({
                        type: 'error',
                        executionId,
                        className,
                        methodName,
                        timestamp: Date.now(),
                        data: { error: err }
                    });
                }
                if (config.logToConsole) {
                    console.error(`❌ [${executionId}] Observable error:`, err);
                }
                return originalSubscriber.error.call(originalSubscriber, err);
            } : undefined,
            complete: originalSubscriber.complete ? () => {
                MonitorSubscribe.emitEvent({
                    type: 'complete',
                    executionId,
                    className,
                    methodName,
                    timestamp: Date.now()
                });
                if (config.logToConsole) {
                    console.log(`✅ [${executionId}] Observable completado`);
                }
                return originalSubscriber.complete.call(originalSubscriber);
            } : undefined
        };
    }
    static executeWithInterception(context, originalMethod, args, ObservableInterceptor, executionId, fullMethodName, config) {
        const globalObj = globalThis;
        const originalGlobalObservable = globalObj.Observable;
        try {
            globalObj.Observable = ObservableInterceptor;
            const originalSubscribe = MonitorSubscribe.originalObservable.prototype.subscribe;
            MonitorSubscribe.originalObservable.prototype.subscribe = function (...subscribeArgs) {
                MonitorSubscribe.emitEvent({
                    type: 'subscribe_called',
                    executionId,
                    className: fullMethodName.split('.')[0],
                    methodName: fullMethodName.split('.')[1],
                    timestamp: Date.now()
                });
                if (config.logToConsole) {
                    console.log(`🔔 [${executionId}] subscribe() llamado en ${fullMethodName}`);
                }
                if (subscribeArgs.length === 0 ||
                    (typeof subscribeArgs[0] === 'function' && !subscribeArgs[1] && !subscribeArgs[2]) ||
                    (subscribeArgs[0] === undefined)) {
                    if (config.logToConsole) {
                        console.log(`⚠️ [${executionId}] Subscribe sin callbacks explícitos`);
                    }
                    const nextCallback = typeof subscribeArgs[0] === 'function' ? subscribeArgs[0] : undefined;
                    const errorCallback = typeof subscribeArgs[1] === 'function' ? subscribeArgs[1] : undefined;
                    const completeCallback = typeof subscribeArgs[2] === 'function' ? subscribeArgs[2] : undefined;
                    const interceptedObserver = {
                        next: nextCallback ? (value) => {
                            if (config.captureValues) {
                                MonitorSubscribe.emitEvent({
                                    type: 'next_value',
                                    executionId,
                                    className: fullMethodName.split('.')[0],
                                    methodName: fullMethodName.split('.')[1],
                                    timestamp: Date.now(),
                                    data: { value, source: 'subscribe' }
                                });
                            }
                            if (config.logToConsole) {
                                console.log(`📥 [${executionId}] Subscribe recibió:`, value);
                            }
                            return nextCallback(value);
                        } : undefined,
                        error: errorCallback ? (err) => {
                            if (config.captureErrors) {
                                MonitorSubscribe.emitEvent({
                                    type: 'error',
                                    executionId,
                                    className: fullMethodName.split('.')[0],
                                    methodName: fullMethodName.split('.')[1],
                                    timestamp: Date.now(),
                                    data: { error: err, source: 'subscribe' }
                                });
                            }
                            if (config.logToConsole) {
                                console.error(`❌ [${executionId}] Subscribe error:`, err);
                            }
                            return errorCallback(err);
                        } : undefined,
                        complete: completeCallback ? () => {
                            MonitorSubscribe.emitEvent({
                                type: 'complete',
                                executionId,
                                className: fullMethodName.split('.')[0],
                                methodName: fullMethodName.split('.')[1],
                                timestamp: Date.now(),
                                data: { source: 'subscribe' }
                            });
                            if (config.logToConsole) {
                                console.log(`✅ [${executionId}] Subscribe completado`);
                            }
                            return completeCallback();
                        } : undefined
                    };
                    return originalSubscribe.call(this, interceptedObserver);
                }
                return originalSubscribe.apply(this, subscribeArgs);
            };
            return originalMethod.apply(context, args);
        }
        finally {
            globalObj.Observable = originalGlobalObservable;
            MonitorSubscribe.originalObservable.prototype.subscribe = MonitorSubscribe.originalSubscribe;
        }
    }
}
exports.MonitorSubscribe = MonitorSubscribe;
MonitorSubscribe.originalObservable = rxjs_1.Observable;
MonitorSubscribe.originalSubscribe = rxjs_1.Observable.prototype.subscribe;
MonitorSubscribe.monitoringActive = false;
MonitorSubscribe.executionCounter = 0;
MonitorSubscribe.eventListeners = new Map();
MonitorSubscribe.instanceMonitors = new Map();
//# sourceMappingURL=om_eventos.js.map