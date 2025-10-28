/**
 * Service pour les groupes
 */
import { apiClient } from "./api";

export interface Group {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  members: string[];
  created_at: string;
  invite_code?: string;
}

export interface GroupsResponse {
  groups: Group[];
  userId: string;
}

/**
 * Crée un nouveau groupe
 */
export async function createGroup(data: {
  name: string;
  description?: string;
}): Promise<{ group: Group | null; error: string | null }> {
  const response = await apiClient.post<{ group: Group }>("/api/groups", data);

  if (response.error || response.status !== 201) {
    return {
      group: null,
      error: response.error || "Erreur lors de la création du groupe",
    };
  }

  return {
    group: response.data?.group || null,
    error: null,
  };
}

/**
 * Rejoindre un groupe via code d'invitation
 */
export async function joinGroup(groupId: string, inviteCode: string): Promise<{ error: string | null }> {
  const response = await apiClient.post(`/api/groups/${groupId}/join`, {
    inviteCode,
  });

  if (response.error || (response.status !== 200 && response.status !== 201)) {
    return {
      error: response.error || "Erreur lors de la connexion au groupe",
    };
  }

  return { error: null };
}

/**
 * Quitter un groupe
 */
export async function leaveGroup(groupId: string): Promise<{ error: string | null }> {
  const response = await apiClient.post(`/api/groups/${groupId}/leave`, {});

  if (response.error || response.status !== 200) {
    return {
      error: response.error || "Erreur lors de la déconnexion du groupe",
    };
  }

  return { error: null };
}

/**
 * Récupère les détails d'un groupe par ID
 */
export async function getGroup(groupId: string): Promise<{ group: Group | null; error: string | null }> {
  const response = await apiClient.get<{ group: Group }>(`/api/groups/${groupId}`);

  if (response.error || response.status !== 200) {
    return {
      group: null,
      error: response.error || "Erreur lors de la récupération du groupe",
    };
  }

  return {
    group: response.data?.group || null,
    error: null,
  };
}
