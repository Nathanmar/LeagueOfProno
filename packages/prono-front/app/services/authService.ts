/**
 * Service d'authentification
 */
import { apiClient } from "./api";

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface AuthResponse {
  message: string;
  user: User;
}

export interface CurrentUserResponse {
  user: User;
  session: {
    id: string;
    expiresAt: string;
  };
}

/**
 * Enregistre un nouvel utilisateur
 */
export async function registerUser(
  username: string,
  email: string,
  password: string
): Promise<{ user: User | null; error: string | null }> {
  const response = await apiClient.post<AuthResponse>("/auth/register", {
    username,
    email,
    password,
  });

  if (response.error || response.status !== 201) {
    return {
      user: null,
      error: response.error || (response.data as { error?: string })?.error || "Erreur lors de l'inscription",
    };
  }

  return {
    user: response.data?.user || null,
    error: null,
  };
}

/**
 * Se connecte avec ses identifiants
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{ user: User | null; error: string | null }> {
  const response = await apiClient.post<AuthResponse>("/auth/login", {
    email,
    password,
  });

  if (response.error || response.status !== 200) {
    return {
      user: null,
      error: response.error || (response.data as { error?: string })?.error || "Erreur lors de la connexion",
    };
  }

  return {
    user: response.data?.user || null,
    error: null,
  };
}

/**
 * Récupère l'utilisateur actuel
 */
export async function getCurrentUser(): Promise<{ user: User | null; error: string | null }> {
  const response = await apiClient.get<CurrentUserResponse>("/auth/me");

  if (response.error || response.status !== 200) {
    return {
      user: null,
      error: response.error || "Non authentifié",
    };
  }

  return {
    user: response.data?.user || null,
    error: null,
  };
}

/**
 * Se déconnecte
 */
export async function logoutUser(): Promise<{ error: string | null }> {
  const response = await apiClient.post("/auth/logout");

  if (response.error || response.status !== 200) {
    return {
      error: response.error || "Erreur lors de la déconnexion",
    };
  }

  return {
    error: null,
  };
}
