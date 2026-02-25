interface ImportMetaEnv {
  readonly DATALIST_STATES?: string;
  readonly DATALIST_CITIES?: string;
  readonly DATALIST_TIMEZONES?: string;
  readonly MS_GROUP_ID?: string;
  readonly MS_SITES_READWRITE_ALL_APP_ID?: string;
  readonly MS_SITES_READWRITE_ALL_SECRET_ID?: string;
  readonly MS_SITES_READWRITE_ALL_SECRET_VALUE?: string;
  readonly WP_USERNAME?: string;
  readonly WP_APP_PASSWORD?: string;
  readonly WORDPRESS_ENDPOINT?: string;
  readonly LIBSQL_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}