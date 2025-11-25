/// <reference types="vite/client" />

declare global {
  interface ImportMetaEnv {
    DEV: boolean;
    PROD: boolean;
    MODE: string;
    BASE_URL: string;
    SSR: boolean;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export {};
