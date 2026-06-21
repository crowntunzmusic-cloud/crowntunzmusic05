declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    NEXT_PUBLIC_CLOUDFLARE_R2_URL?: string;
    NEXT_PUBLIC_SUPABASE_URL?: string;
  }
}

export {};
