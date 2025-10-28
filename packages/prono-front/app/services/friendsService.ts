/**
 * Service pour les amis
 */
import { apiClient } from "./api";

export interface Friend {
  id: string;
  username: string;
  avatar?: string;
  score: number;
}

export interface FriendsResponse {
  friends: Friend[];
}

/**
 * Récupère la liste des amis
 */
export async function getFriends(): Promise<{ friends: Friend[]; error: string | null }> {
  const response = await apiClient.get<FriendsResponse>("/data/friends");

  if (response.error || response.status !== 200) {
    return {
      friends: [],
      error: response.error || "Erreur lors du chargement des amis",
    };
  }

  return {
    friends: response.data?.friends || [],
    error: null,
  };
}

/**
 * Ajoute un ami
 */
export async function addFriend(username: string): Promise<{ friend: Friend | null; error: string | null }> {
  const response = await apiClient.post<Friend>("/data/friends", { username });

  if (response.error || response.status !== 201) {
    return {
      friend: null,
      error: response.error || "Erreur lors de l'ajout de l'ami",
    };
  }

  return {
    friend: response.data || null,
    error: null,
  };
}

/**
 * Supprime un ami
 */
export async function removeFriend(friendId: string): Promise<{ error: string | null }> {
  const response = await apiClient.delete(`/data/friends/${friendId}`);

  if (response.error || response.status !== 200) {
    return {
      error: response.error || "Erreur lors de la suppression de l'ami",
    };
  }

  return {
    error: null,
  };
}
