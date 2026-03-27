export interface TokenPayload {
  userId: string;
  type: 'access' | 'refresh';
  exp: number;
}

export interface LoginRequest {
  key: string;
}

export interface LoginResponse {
  user_id: string;
  access_token: string;
  refresh_token: string;
  device_id: string;
}

export interface RefreshResponse {
  access_token: string;
}

export interface ProfileResponse {
  type: 'normal' | 'server';
  identities: {
    id: string;
    provider_type: string;
  }[];
  data: Record<string, any>;
}
