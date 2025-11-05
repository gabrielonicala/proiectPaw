// Global type declarations
declare global {
  var tempOAuthData: Map<string, {
    email: string;
    provider: string;
    providerAccountId: string;
    access_token?: string | null;
    refresh_token?: string | null;
    expires_at?: number | null;
    token_type?: string | null;
    scope?: string | null;
    id_token?: string | null;
    session_state?: string | null;
    type: string;
    timestamp: number;
  }> | undefined;
}

export {};

