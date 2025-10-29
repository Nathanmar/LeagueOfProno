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

export interface FriendRequest {
  id: string;
  from_user_id: string;
  from_username: string;
  status: "pending" | "accepted" | "rejected" | "blocked";
  created_at: string;
}

export interface FriendsResponse {
  friends: Friend[];
}

/**
 * Récupère la liste des amis acceptés
 */
export async function getFriends(): Promise<{ friends: Friend[]; error: string | null }> {
  const response = await apiClient.get<FriendsResponse>("/api/friends");

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
 * Récupère les demandes d'ami reçues
 */
export async function getFriendRequests(): Promise<{ requests: FriendRequest[]; error: string | null }> {
  try {
    const response = await apiClient.get<{ requests: FriendRequest[] }>("/api/friend-requests");

    console.log("[getFriendRequests] Response:", response);

    if (response.error || response.status !== 200) {
      console.error("[getFriendRequests] Error:", response.error, "Status:", response.status);
      return {
        requests: [],
        error: response.error || "Erreur lors du chargement des demandes",
      };
    }

    const requests = response.data?.requests || [];
    console.log("[getFriendRequests] Requests loaded:", requests);

    return {
      requests,
      error: null,
    };
  } catch (error) {
    console.error("[getFriendRequests] Exception:", error);
    return {
      requests: [],
      error: "Erreur lors du chargement des demandes",
    };
  }
}

/**
 * Envoie une demande d'ami par email
 */
export async function sendFriendRequest(email: string): Promise<{ success: boolean; error: string | null }> {
  const response = await apiClient.post("/api/friend-requests", { email });

  if (response.error || (response.status !== 200 && response.status !== 201)) {
    return {
      success: false,
      error: response.error || "Erreur lors de l'envoi de la demande",
    };
  }

  return {
    success: true,
    error: null,
  };
}

/**
 * Accepte une demande d'ami
 */
export async function acceptFriendRequest(requestId: string): Promise<{ success: boolean; error: string | null }> {
  const response = await apiClient.post(`/api/friend-requests/${requestId}/accept`, {});

  if (response.error || response.status !== 200) {
    return {
      success: false,
      error: response.error || "Erreur lors de l'acceptation de la demande",
    };
  }

  return {
    success: true,
    error: null,
  };
}

/**
 * Refuse une demande d'ami
 */
export async function rejectFriendRequest(requestId: string): Promise<{ success: boolean; error: string | null }> {
  const response = await apiClient.post(`/api/friend-requests/${requestId}/reject`, {});

  if (response.error || response.status !== 200) {
    return {
      success: false,
      error: response.error || "Erreur lors du refus de la demande",
    };
  }

  return {
    success: true,
    error: null,
  };
}

/**
 * Supprime un ami
 */
export async function removeFriend(friendId: string): Promise<{ error: string | null }> {
  const response = await apiClient.delete(`/api/friends/${friendId}`);

  if (response.error || response.status !== 200) {
    return {
      error: response.error || "Erreur lors de la suppression de l'ami",
    };
  }

  return {
    error: null,
  };
}
