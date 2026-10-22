/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USAR_MOCK?: string;
  readonly VITE_API_URL?: string;
  readonly VITE_API_SCANS_URL?: string;
  readonly VITE_CLASSIFICACAO_URL?: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
