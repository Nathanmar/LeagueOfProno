/**
 * Service pour les matchs
 */
import { apiClient, realtimeClient } from "./api";

export interface Match {
  id: string;
  team1: string;
  team2: string;
  match_date: string;
  scheduled_at: string;
  status: "scheduled" | "live" | "finished";
  score_team1?: number;
  score_team2?: number;
  team_a?: string;
  team_b?: string;
  score1?: number;
  score2?: number;
  score_a?: number;
  score_b?: number;
  tournament?: string;
  winner?: string;
}

export interface MatchesResponse {
  matches: Match[];
  userId: string;
}

/**
 * Récupère tous les matchs
 */
export async function getMatches(): Promise<{ matches: Match[]; error: string | null }> {
  const response = await apiClient.get<MatchesResponse>("/api/matches");

  if (response.error || response.status !== 200) {
    return {
      matches: [],
      error: response.error || "Erreur lors du chargement des matchs",
    };
  }

  return {
    matches: response.data?.matches || [],
    error: null,
  };
}

/**
 * S'abonne aux mises à jour en temps réel des matchs
 */
export function subscribeToMatches(callback: (matches: Match[]) => void): () => void {
  // Le serveur envoie les mises à jour via "matches:updated"
  return realtimeClient.subscribe("matches:updated", (data) => {
    if (Array.isArray(data)) {
      callback(data);
    }
  });
}

/**
 * Envoie une prédiction pour un match
 */
export async function submitPrediction(
  matchId: string,
  prediction: {
    team1_score?: number;
    team2_score?: number;
    winner?: string;
  }
): Promise<{ error: string | null }> {
  const response = await apiClient.post(`/api/matches/${matchId}/predict`, prediction);

  if (response.error || (response.status !== 200 && response.status !== 201)) {
    return {
      error: response.error || "Erreur lors de l'envoi de la prédiction",
    };
  }

  return {
    error: null,
  };
}
