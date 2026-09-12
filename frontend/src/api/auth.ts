import { api } from "./client";

export interface User {
  id: number;
  username: string;
}

export interface AuthCredentials {
  username: string;
  password: string;
}

export async function login(
  credentials: AuthCredentials
): Promise<{ accessToken: string }> {
  return api.post("/api/auth/login", credentials);
}

export async function register(credentials: AuthCredentials): Promise<void> {
  return api.post("/api/auth/register", credentials);
}

export async function getMe(): Promise<{ user: User }> {
  return api.get("/api/auth/me");
}
