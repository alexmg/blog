/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly RAINDROP_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
