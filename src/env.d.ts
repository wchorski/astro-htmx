interface ImportMetaEnv {
  readonly DATALIST_STATES?: string;
  readonly DATALIST_CITIES?: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}