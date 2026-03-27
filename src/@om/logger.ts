// logger.ts - Versión compatible con navegador

// Interfaces para TypeScript
interface Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

// Niveles de log
enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

// Implementación simplificada para navegador
class BrowserFileHandler {
  private logs: string[] = [];
  private maxEntries: number = 1000; // Límite de entradas en memoria

  write(message: string): void {
    this.logs.push(message);
    
    // Mantener solo las entradas más recientes
    if (this.logs.length > this.maxEntries) {
      this.logs = this.logs.slice(-this.maxEntries);
    }

    // Opcional: guardar en localStorage para persistencia
    this.saveToLocalStorage();
  }

  private saveToLocalStorage(): void {
    try {
      // Guardar solo las últimas 100 entradas en localStorage
      const recentLogs = this.logs.slice(-100);
      localStorage.setItem('browser-logs', JSON.stringify(recentLogs));
    } catch (error) {
      // localStorage puede estar lleno o no disponible
      console.warn('No se pudo guardar logs en localStorage:', error);
    }
  }

  getLogs(): string[] {
    return [...this.logs];
  }

  clear(): void {
    this.logs = [];
    try {
      localStorage.removeItem('browser-logs');
    } catch (error) {
      console.warn('No se pudo limpiar logs de localStorage:', error);
    }
  }
}

class ModuleLogger implements Logger {
  private moduleName: string;
  private level: LogLevel;
  private fileHandler: BrowserFileHandler;
  private consoleHandler: boolean = true;

  constructor(moduleName: string) {
    this.moduleName = moduleName;
    this.level = this.getLogLevelFromEnv();
    this.fileHandler = new BrowserFileHandler();
  }

  private getLogLevelFromEnv(): LogLevel {
    // En navegador, usar localStorage o valor por defecto
    if (typeof window !== 'undefined') {
      const envLevel = localStorage.getItem('LOG_LEVEL') || 'INFO';
      return LogLevel[envLevel.toUpperCase() as keyof typeof LogLevel] || LogLevel.INFO;
    }
    return LogLevel.INFO;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const currentLevelIndex = levels.indexOf(this.level);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private formatMessage(level: LogLevel, message: string, file?: string, line?: number): string {
    const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
    const fileInfo = file && line ? `${this.getFileName(file)}:${line}` : '';
    
    return `${timestamp} - ${level} - ${this.moduleName} - ${fileInfo} - ${message}`;
  }

  private getFileName(filePath: string): string {
    // Implementación simple para obtener nombre de archivo
    const parts = filePath.split('/');
    return parts[parts.length - 1] || filePath;
  }

  private log(level: LogLevel, message: string, ...args: any[]): void {
    if (!this.shouldLog(level)) {
      return;
    }

    // Obtener información del archivo llamante
    const stack = new Error().stack;
    let file: string | undefined;
    let line: number | undefined;

    if (stack) {
      const stackLines = stack.split('\n');
      // Buscar la primera línea que no sea de este archivo
      for (let i = 3; i < stackLines.length; i++) {
        const lineText = stackLines[i];
        const match = lineText.match(/\((.*):(\d+):(\d+)\)/) || lineText.match(/at (.*):(\d+):(\d+)/);
        if (match && !match[1].includes('logger.ts')) {
          file = match[1];
          line = parseInt(match[2]);
          break;
        }
      }
    }

    const formattedMessage = this.formatMessage(level, message, file, line);
    const fullMessage = args.length > 0 ? `${formattedMessage} ${args.join(' ')}` : formattedMessage;

    // "Escribir" en el manejador de archivos (en memoria)
    this.fileHandler.write(fullMessage);

    // Escribir en consola
    if (this.consoleHandler) {
      const colors = {
        [LogLevel.DEBUG]: '\x1b[36m', // Cyan
        [LogLevel.INFO]: '\x1b[32m',  // Green
        [LogLevel.WARN]: '\x1b[33m',  // Yellow
        [LogLevel.ERROR]: '\x1b[31m'  // Red
      };
      const reset = '\x1b[0m';
      
      console.log(`${colors[level]}${fullMessage}${reset}`);
    }
  }

  debug(message: string, ...args: any[]): void {
    this.log(LogLevel.DEBUG, message, ...args);
  }

  info(message: string, ...args: any[]): void {
    this.log(LogLevel.INFO, message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.log(LogLevel.WARN, message, ...args);
  }

  error(message: string, ...args: any[]): void {
    this.log(LogLevel.ERROR, message, ...args);
  }

  setConsoleOutput(enabled: boolean): void {
    this.consoleHandler = enabled;
  }

  setLevel(level: LogLevel): void {
    this.level = level;
    
    // Guardar preferencia en localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('LOG_LEVEL', level);
      } catch (error) {
        console.warn('No se pudo guardar nivel de log en localStorage:', error);
      }
    }
  }

  // Método para obtener logs (útil para debugging)
  getLogHistory(): string[] {
    return this.fileHandler.getLogs();
  }

  // Método para exportar logs
  exportLogs(): string {
    return this.fileHandler.getLogs().join('\n');
  }

  // Método para limpiar logs
  clearLogs(): void {
    this.fileHandler.clear();
  }
}

// Cache de loggers para evitar duplicados
const loggerCache = new Map<string, ModuleLogger>();

function getModuleLogger(module?: any): Logger {
  let moduleName: string = 'unknown';

  if (module === undefined || module === null) {
    // Obtener automáticamente el módulo llamador
    const stack = new Error().stack;
    if (stack) {
      const stackLines = stack.split('\n');
      for (let i = 2; i < stackLines.length; i++) {
        const line = stackLines[i];
        const match = line.match(/\((.*):\d+:\d+\)/) || line.match(/at (.*):\d+:\d+/);
        if (match && !match[1].includes('logger.ts')) {
          // Extraer solo el nombre del archivo sin extensión
          const fullPath = match[1];
          const fileName = fullPath.split('/').pop() || fullPath;
          moduleName = fileName.replace(/\.[^/.]+$/, ""); // Remover extensión
          break;
        }
      }
    }
  } else if (typeof module === 'string') {
    moduleName = module;
  } else if (module.constructor && module.constructor.name) {
    // Si es una clase o instancia
    moduleName = module.constructor.name;
  } else {
    moduleName = module.constructor?.name || 'unknown';
  }

  // Usar logger existente o crear uno nuevo
  if (!loggerCache.has(moduleName)) {
    loggerCache.set(moduleName, new ModuleLogger(moduleName));
  }

  return loggerCache.get(moduleName)!;
}

function configureModuleLogger(_logger: ModuleLogger, moduleName: string): void {
  console.log(`Logger configurado para módulo: ${moduleName}`);
}

// Exportaciones
export { 
  getModuleLogger, 
  configureModuleLogger, 
  ModuleLogger, 
  LogLevel,
  BrowserFileHandler 
};
export type { Logger };

// Exportación por defecto para fácil importación
export default getModuleLogger;