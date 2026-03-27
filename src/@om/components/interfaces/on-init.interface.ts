// src/core/interfaces/on-init.interface.ts (NUEVO ARCHIVO)

/**
 * Interfaz para el ciclo de vida OnInit
 * Similar a Angular's OnInit
 */
export interface OmInit {
    /**
     * Método llamado después de que Angular haya inicializado 
     * todas las propiedades data-bound del componente.
     */
    omInit(): void;
  }