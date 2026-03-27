// src/core/interfaces/parent-child.interface.ts
export interface ComponentChild {
    parent?: any;
    setParent?(parent: any): void;
  }
  
  export interface ComponentParent {
    children?: any[];
    addChild?(child: any): void;
    removeChild?(child: any): void;
  }