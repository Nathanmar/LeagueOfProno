/**
 * Service pour les badges
 */
import { apiClient } from "./api";

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlocked_at?: string;
}

export interface BadgesResponse {
  badges: Badge[];
}

/**
 * Récupère tous les badges de l'utilisateur
 */
export async function getUserBadges(): Promise<{ badges: Badge[] | null; error: string | null }> {
  const response = await apiClient.get<BadgesResponse>("/api/badges");

  if (response.error || response.status !== 200) {
    return {
      badges: null,
      error: response.error || "Erreur lors du chargement des badges",
    };
  }

  return {
    badges: response.data?.badges || [],
    error: null,
  };
}

/**
 * Déverrouille un badge pour l'utilisateur
 */
export async function unlockBadge(badgeId: string): Promise<{ error: string | null }> {
  const response = await apiClient.post("/api/badges/unlock", {
    badgeId,
  });

  if (response.error || (response.status !== 200 && response.status !== 201)) {
    return {
      error: response.error || "Erreur lors du déverrouillage du badge",
    };
  }

  return { error: null };
}

/**
 * Badges disponibles (définition locale)
 */
export const AVAILABLE_BADGES: Badge[] = [
  {
    id: "first_prediction",
    name: "Premier pas",
    icon: "👣",
    description: "Faire votre premier pronostic",
  },
  {
    id: "perfect_score",
    name: "Score parfait",
    icon: "🎯",
    description: "Prédire un score exact",
  },
  {
    id: "winning_streak",
    name: "Série de victoires",
    icon: "🔥",
    description: "Gagner 5 pronostics consécutifs",
  },
  {
    id: "group_leader",
    name: "Leader du groupe",
    icon: "👑",
    description: "Être le meilleur du groupe pendant un mois",
  },
  {
    id: "expert",
    name: "Expert",
    icon: "🧠",
    description: "Atteindre 80% de taux de réussite",
  },
  {
    id: "collector",
    name: "Collectionneur",
    icon: "🏆",
    description: "Débloquer 5 badges",
  },
];
