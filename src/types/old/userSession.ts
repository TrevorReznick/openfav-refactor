export interface UserSession {
  id: string;
  email: string;
  fullName: string;
  createdAt: Date;
  lastLogin: Date;
  isAuthenticated: boolean;
  tokens?: {
    accessToken: string | null;
    refreshToken: string | null;
    expiresAt?: number;
  };
  metadata?: {
    provider: string;
    avatarUrl?: string;
    // altri metadati che potrebbero servirti
  };
}