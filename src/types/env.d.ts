declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SITE_URL: string;
    NEXT_PUBLIC_META_PIXEL_ID: string;
    NEXT_PUBLIC_GA_ID: string;
    NEXT_PUBLIC_JOFI_WHATSAPP: string;
    NEXT_PUBLIC_SERENINHO_CHECKOUT_URL: string;
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: string;
    RD_STATION_TOKEN: string;
    TURNSTILE_SECRET_KEY: string;
    CRON_SECRET: string;
    ADMIN_USER: string;
    ADMIN_PASSWORD: string;
    ADMIN_PANEL_ENABLED: 'true' | 'false';
    HMAC_SECRET: string;
    SENTRY_DSN?: string;
    KV_URL?: string;
    KV_REST_API_URL?: string;
    KV_REST_API_TOKEN?: string;
    KV_REST_API_READ_ONLY_TOKEN?: string;
  }
}
