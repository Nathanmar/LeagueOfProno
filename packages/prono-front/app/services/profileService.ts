/**
 * Service pour le profil utilisateur
 */
import { apiClient } from "./api";

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  score: number;
  predictions_count: number;
  wins_count: number;
}

export interface ProfileResponse {
  profile: UserProfile;
}

/**
 * Récupère le profil de l'utilisateur actuel
 */
export async function getProfile(): Promise<{ profile: UserProfile | null; error: string | null }> {
  const response = await apiClient.get<ProfileResponse>("/data/profile");

  if (response.error || response.status !== 200) {
    return {
      profile: null,
      error: response.error || "Erreur lors du chargement du profil",
    };
  }

  return {
    profile: response.data?.profile || null,
    error: null,
  };
}

/**
 * Récupère le profil d'un utilisateur par son ID
 */
export async function getUserProfile(userId: string): Promise<{ profile: UserProfile | null; error: string | null }> {
  const response = await apiClient.get<ProfileResponse>(`/data/profile/${userId}`);

  if (response.error || response.status !== 200) {
    return {
      profile: null,
      error: response.error || "Erreur lors du chargement du profil",
    };
  }

  return {
    profile: response.data?.profile || null,
    error: null,
  };
}

/**
 * Met à jour le profil
 */
export async function updateProfile(updates: Partial<UserProfile>): Promise<{ profile: UserProfile | null; error: string | null }> {
  const response = await apiClient.put<ProfileResponse>("/data/profile", updates);

  if (response.error || response.status !== 200) {
    return {
      profile: null,
      error: response.error || "Erreur lors de la mise à jour du profil",
    };
  }

  return {
    profile: response.data?.profile || null,
    error: null,
  };
}
