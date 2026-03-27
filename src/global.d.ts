// src/types/global.d.ts

/**
 * Declaración global para window en entorno Node.js
 * Permite que TypeScript reconozca window sin errores
 */

// Extender el objeto global de Node.js
declare global {
    var window: Window & typeof globalThis;
}

// Declaración del objeto Window para Node.js
interface Window {
    crypto: Crypto;
    location: Location;
    [key: string]: any;
}

// Definición básica de Crypto (solo lo que necesitas)
interface Crypto {
    subtle: SubtleCrypto;
    getRandomValues<T extends ArrayBufferView | null>(array: T): T;
}

// Definición básica de SubtleCrypto
interface SubtleCrypto {
    digest(algorithm: AlgorithmIdentifier, data: BufferSource): Promise<ArrayBuffer>;
    encrypt(
        algorithm: AlgorithmIdentifier,
        key: CryptoKey,
        data: BufferSource
    ): Promise<ArrayBuffer>;
    decrypt(
        algorithm: AlgorithmIdentifier,
        key: CryptoKey,
        data: BufferSource
    ): Promise<ArrayBuffer>;
}

// Definición básica de Location (para router)
interface Location {
    href: string;
    protocol: string;
    host: string;
    hostname: string;
    port: string;
    pathname: string;
    search: string;
    hash: string;
    origin: string;
    assign(url: string): void;
    replace(url: string): void;
    reload(): void;
}

export {};