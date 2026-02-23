interface ImportMetaEnv {
  readonly DATALIST_STATES?: string;
  readonly DATALIST_CITIES?: string;
  readonly DATALIST_TIMEZONES?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}