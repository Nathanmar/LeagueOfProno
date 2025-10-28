/**
 * Service pour récupérer les données depuis l'API (Convex via prono-api)
 * Remplace progressivement les données mocké
 */

import { apiClient, endpoints } from "../services/api";
import type { User, Group, Match, Prediction } from "../data/mockData";
import {
  adaptConvexMatch,
  adaptConvexPrediction,
  adaptConvexGroup,
  adaptConvexUser,
} from "../data/dataAdapter";

/**
 * Récupère tous les matchs depuis l'API
 */
export async function fetchMatches(): Promise<Match[]> {
  try {
    const data = await apiClient.get<Record<string, unknown>[]>(endpoints.matches);
    if (!Array.isArray(data)) {
      console.warn("Expected array of matches, got:", typeof data);
      return [];
    }
    return data.map(adaptConvexMatch);
  } catch (error) {
    console.error("Error fetching matches:", error);
    return [];
  }
}

/**
 * Récupère un match par ID
 */
export async function fetchMatchById(id: string): Promise<Match | null> {
  try {
    const data = await apiClient.get<Record<string, unknown>>(endpoints.matchById(id));
    return adaptConvexMatch(data);
  } catch (error) {
    console.error(`Error fetching match ${id}:`, error);
    return null;
  }
}

/**
 * Récupère tous les groupes depuis l'API
 */
export async function fetchGroups(): Promise<Group[]> {
  try {
    const data = await apiClient.get<Record<string, unknown>[]>(endpoints.groups);
    if (!Array.isArray(data)) {
      console.warn("Expected array of groups, got:", typeof data);
      return [];
    }
    return data.map(adaptConvexGroup);
  } catch (error) {
    console.error("Error fetching groups:", error);
    return [];
  }
}

/**
 * Crée un nouveau groupe
 */
export async function createGroup(
  groupData: Omit<Group, "id" | "invite_code">
): Promise<Group | null> {
  try {
    const data = await apiClient.post<Record<string, unknown>>(
      endpoints.createGroup,
      groupData
    );
    return adaptConvexGroup(data);
  } catch (error) {
    console.error("Error creating group:", error);
    return null;
  }
}

/**
 * Récupère un groupe par ID
 */
export async function fetchGroupById(id: string): Promise<Group | null> {
  try {
    const groups = await fetchGroups();
    return groups.find((g) => g.id === id) || null;
  } catch (error) {
    console.error(`Error fetching group ${id}:`, error);
    return null;
  }
}

/**
 * Récupère le classement d'un groupe
 */
export async function fetchGroupLeaderboard(
  groupId: string
): Promise<Array<{ userId: string; userName: string; score: number }>> {
  try {
    const data = await apiClient.get<
      Array<{ user_id: string; email: string; score: number; rank: number }>
    >(endpoints.groupLeaderboard(groupId));
    
    if (!Array.isArray(data)) {
      console.warn("Expected array of leaderboard entries, got:", typeof data);
      return [];
    }

    return data.map((entry) => ({
      userId: entry.user_id,
      userName: entry.email || "Unknown",
      score: Number(entry.score) || 0,
    }));
  } catch (error) {
    console.error(`Error fetching leaderboard for group ${groupId}:`, error);
    return [];
  }
}

/**
 * Récupère toutes les prédictions
 */
export async function fetchPredictions(): Promise<Prediction[]> {
  try {
    const data = await apiClient.get<Record<string, unknown>[]>(endpoints.predictions);
    if (!Array.isArray(data)) {
      console.warn("Expected array of predictions, got:", typeof data);
      return [];
    }
    return data.map(adaptConvexPrediction);
  } catch (error) {
    console.error("Error fetching predictions:", error);
    return [];
  }
}

/**
 * Récupère les prédictions pour un utilisateur spécifique
 */
export async function fetchUserPredictions(userId: string): Promise<Prediction[]> {
  try {
    const allPredictions = await fetchPredictions();
    return allPredictions.filter((p) => p.user_id === userId);
  } catch (error) {
    console.error(`Error fetching predictions for user ${userId}:`, error);
    return [];
  }
}

/**
 * Récupère les prédictions pour un match spécifique
 */
export async function fetchMatchPredictions(matchId: string): Promise<Prediction[]> {
  try {
    const allPredictions = await fetchPredictions();
    return allPredictions.filter((p) => p.match_id === matchId);
  } catch (error) {
    console.error(`Error fetching predictions for match ${matchId}:`, error);
    return [];
  }
}

/**
 * Crée une nouvelle prédiction
 */
export async function createPrediction(prediction: Omit<Prediction, "id">): Promise<Prediction | null> {
  try {
    const data = await apiClient.post<Record<string, unknown>>(endpoints.createPrediction, prediction);
    return adaptConvexPrediction(data);
  } catch (error) {
    console.error("Error creating prediction:", error);
    return null;
  }
}

/**
 * Récupère l'utilisateur courant (depuis l'authentification)
 */
export async function fetchCurrentUser(): Promise<User | null> {
  try {
    const data = await apiClient.get<Record<string, unknown>>(endpoints.currentUser);
    return adaptConvexUser(data);
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}

/**
 * Récupère un utilisateur par ID
 */
export async function fetchUserById(id: string): Promise<User | null> {
  try {
    const data = await apiClient.get<Record<string, unknown>>(endpoints.userById(id));
    return adaptConvexUser(data);
  } catch (error) {
    console.error(`Error fetching user ${id}:`, error);
    return null;
  }
}

/**
 * Récupère tous les utilisateurs
 */
export async function fetchUsers(): Promise<User[]> {
  try {
    const data = await apiClient.get<Record<string, unknown>[]>(endpoints.users);
    if (!Array.isArray(data)) {
      console.warn("Expected array of users, got:", typeof data);
      return [];
    }
    return data.map(adaptConvexUser);
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

/**
 * Récupère les utilisateurs d'un groupe
 */
export async function fetchGroupUsers(groupId: string): Promise<User[]> {
  try {
    const group = await fetchGroupById(groupId);
    if (!group) return [];

    const users = await fetchUsers();
    return users.filter((u) => group.members.includes(u.id));
  } catch (error) {
    console.error(`Error fetching group users for ${groupId}:`, error);
    return [];
  }
}
