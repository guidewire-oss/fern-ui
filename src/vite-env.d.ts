/// <reference types="vite/client" />

interface ImportMetaEnv {
  VITE_FERN_REPORTER_HEADER_NAME: string;
  // Add other environment variables here as needed
}

interface ImportMeta {
  env: ImportMetaEnv;
}
